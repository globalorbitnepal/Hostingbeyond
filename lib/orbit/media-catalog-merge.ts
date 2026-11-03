import type {
  listUploadFiles,
  listBundledSiteMedia,
} from "@/lib/orbit/uploads";

export type DiskMediaFile = Awaited<ReturnType<typeof listUploadFiles>>[number];

export type VirtualMediaAsset = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: null;
  height: null;
  alt: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  source: "upload" | "site";
};

/** In-memory catalog entry for disk files not yet imported via POST upload. */
export function virtualMediaAssetFromDisk(
  file: DiskMediaFile,
  source: "upload" | "site" = "upload",
): VirtualMediaAsset {
  return {
    id: source === "site" ? `site:${file.url}` : file.filename,
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
    source,
  };
}

type DbLike = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Merges DB rows with disk/bundled files without writing to the database.
 * Previously GET /api/orbit/media created rows on every list — that side effect is removed.
 */
export function mergeOrbitMediaCatalog(input: {
  dbAssets: DbLike[];
  diskFiles: DiskMediaFile[];
  bundledFiles: DiskMediaFile[];
}): Array<DbLike & { source: "upload" | "site" }> {
  const known = new Set(
    input.dbAssets.flatMap((asset) => [asset.filename, asset.url]),
  );
  const dbAssets = [...input.dbAssets];

  for (const file of input.diskFiles) {
    if (known.has(file.filename) || known.has(file.url)) continue;
    const virtual = virtualMediaAssetFromDisk(file, "upload");
    dbAssets.push(virtual);
    known.add(file.filename);
    known.add(file.url);
  }

  const byFilename = new Map(dbAssets.map((asset) => [asset.filename, asset]));
  for (const file of input.diskFiles) {
    const row = byFilename.get(file.filename);
    if (row && (!row.url || row.url.startsWith("/api/"))) {
      row.url = file.url;
    }
  }

  const merged = [
    ...dbAssets.filter((asset) =>
      input.diskFiles.some((file) => file.filename === asset.filename),
    ),
    ...dbAssets.filter(
      (asset) =>
        !input.diskFiles.some((file) => file.filename === asset.filename),
    ),
  ];

  const unique = new Map<string, DbLike & { source: "upload" | "site" }>();
  for (const asset of merged) {
    const key = asset.url || asset.filename;
    if (!unique.has(key)) {
      unique.set(key, {
        ...asset,
        source:
          asset.url.startsWith("/uploads/") ||
          asset.url.startsWith("/api/uploads/")
            ? "upload"
            : "site",
      });
    }
  }

  for (const file of input.bundledFiles) {
    if (unique.has(file.url)) continue;
    unique.set(file.url, virtualMediaAssetFromDisk(file, "site"));
  }

  return [...unique.values()];
}
