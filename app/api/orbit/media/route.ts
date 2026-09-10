import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { logActivity } from "@/lib/orbit/session";
import {
  describeUploadRejection,
  extensionForUpload,
  isAllowedUpload,
  listBundledSiteMedia,
  listUploadFiles,
  mimeFromFilename,
  saveUploadFile,
} from "@/lib/orbit/uploads";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const [diskFiles, bundledFiles] = await Promise.all([
    listUploadFiles(),
    listBundledSiteMedia(),
  ]);

  let dbAssets: Awaited<ReturnType<typeof prisma.mediaAsset.findMany>> = [];
  try {
    dbAssets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 2000,
    });
  } catch {
    dbAssets = [];
  }

  const known = new Set(
    dbAssets.flatMap((asset) => [asset.filename, asset.url]),
  );

  for (const file of diskFiles) {
    if (known.has(file.filename) || known.has(file.url)) continue;
    try {
      const created = await prisma.mediaAsset.create({
        data: {
          filename: file.filename,
          originalName: file.filename,
          mimeType: file.mimeType || "application/octet-stream",
          size: file.size,
          alt: "",
          url: file.url,
        },
      });
      dbAssets.push(created);
      known.add(file.filename);
      known.add(file.url);
    } catch {
      dbAssets.push({
        id: file.filename,
        filename: file.filename,
        originalName: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        width: null,
        height: null,
        alt: "",
        url: file.url,
        createdAt: new Date(file.mtimeMs),
        updatedAt: new Date(file.mtimeMs),
      });
    }
  }

  const byFilename = new Map(dbAssets.map((asset) => [asset.filename, asset]));
  for (const file of diskFiles) {
    const row = byFilename.get(file.filename);
    if (row && (!row.url || row.url.startsWith("/api/"))) {
      row.url = file.url;
    }
  }

  const merged = [
    ...dbAssets.filter((asset) =>
      diskFiles.some((file) => file.filename === asset.filename),
    ),
    ...dbAssets.filter(
      (asset) => !diskFiles.some((file) => file.filename === asset.filename),
    ),
  ];

  const unique = new Map<string, (typeof merged)[number]>();
  for (const asset of merged) {
    const key = asset.url || asset.filename;
    if (!unique.has(key)) unique.set(key, asset);
  }

  for (const file of bundledFiles) {
    if (unique.has(file.url)) continue;
    unique.set(file.url, {
      id: `site:${file.url}`,
      filename: file.filename,
      originalName: file.url,
      mimeType: file.mimeType,
      size: file.size,
      width: null,
      height: null,
      alt: "",
      url: file.url,
      createdAt: new Date(file.mtimeMs),
      updatedAt: new Date(file.mtimeMs),
    });
  }

  const assets = [...unique.values()]
    .map((asset) => ({
      ...asset,
      source:
        asset.url.startsWith("/uploads/") || asset.url.startsWith("/api/uploads/")
          ? ("upload" as const)
          : ("site" as const),
    }))
    .sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });

  const filtered = q
    ? assets.filter(
        (asset) =>
          asset.originalName.toLowerCase().includes(q) ||
          asset.alt.toLowerCase().includes(q) ||
          asset.filename.toLowerCase().includes(q) ||
          asset.url.toLowerCase().includes(q),
      )
    : assets;

  return NextResponse.json({ assets: filtered });
}

export async function POST(request: NextRequest) {
  const admin = await requireOrbitAdmin();
  if (!admin) return unauthorizedJson();

  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!isAllowedUpload(file.type, file.name)) {
    return NextResponse.json(
      {
        error: describeUploadRejection(file.type, file.name),
        details: `Received ${file.name || "unnamed file"} (${file.type || "unknown type"}, ${(file.size / 1024).toFixed(1)} KB)`,
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum is 8 MB.`,
        details: file.name,
      },
      { status: 400 },
    );
  }

  try {
    const mimeType = file.type || mimeFromFilename(file.name, "image/png");
    const safeExt = extensionForUpload(file.name, mimeType);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await saveUploadFile(filename, bytes);
    const url = `/uploads/${filename}`;

    let asset = {
      id: filename,
      filename,
      url,
      originalName: file.name.slice(0, 180),
      mimeType,
      size: file.size,
      alt: alt.slice(0, 200),
      source: "upload" as const,
    };

    try {
      asset = {
        ...(await prisma.mediaAsset.create({
          data: {
            filename,
            originalName: asset.originalName,
            mimeType,
            size: file.size,
            alt: asset.alt,
            url,
          },
        })),
        source: "upload" as const,
      };
    } catch {
      /* file is already on disk — library GET will pick it up */
    }

    await logActivity({
      adminUserId: admin.id,
      action: "MEDIA_UPLOAD",
      resource: asset.id,
      details: asset.originalName,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";
    return NextResponse.json(
      {
        error: "Could not save the image file.",
        details: [code, message].filter(Boolean).join(" — "),
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  return NextResponse.json(
    {
      error:
        "Uploaded images are kept permanently and cannot be deleted from Orbit.",
    },
    { status: 405 },
  );
}
