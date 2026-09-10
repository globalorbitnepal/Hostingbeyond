import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOrbitAdmin, unauthorizedJson } from "@/lib/orbit/api";
import { logActivity } from "@/lib/orbit/session";
import {
  extensionForUpload,
  isAllowedUpload,
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
  const diskFiles = await listUploadFiles();

  let dbAssets: Awaited<ReturnType<typeof prisma.mediaAsset.findMany>> = [];
  try {
    dbAssets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
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
    if (!unique.has(asset.filename)) unique.set(asset.filename, asset);
  }

  const assets = [...unique.values()].sort((a, b) => {
    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
    return bTime - aTime;
  });

  const filtered = q
    ? assets.filter(
        (asset) =>
          asset.originalName.toLowerCase().includes(q) ||
          asset.alt.toLowerCase().includes(q) ||
          asset.filename.toLowerCase().includes(q),
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
      { error: "Unsupported file type" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 8MB)" },
      { status: 400 },
    );
  }

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
  };

  try {
    asset = await prisma.mediaAsset.create({
      data: {
        filename,
        originalName: asset.originalName,
        mimeType,
        size: file.size,
        alt: asset.alt,
        url,
      },
    });
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
