import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import os from "os";
import path from "path";

export const UPLOAD_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const ALLOWED_MIME = new Set([...Object.values(UPLOAD_MIME), "image/jpg"]);

const ALLOWED_EXT = new Set(Object.keys(UPLOAD_MIME));

const PRODUCTION_UPLOAD_DIR = "/data/hostingbeyond/uploads";

export function getPublicUploadDir() {
  return path.join(process.cwd(), "public", "uploads");
}

function addDir(dirs: string[], dir?: string | null) {
  const value = dir?.trim();
  if (value && !dirs.includes(value)) dirs.push(value);
}

/** Every folder Orbit has ever written to — production must still serve old files. */
function uploadDirCandidates() {
  const dirs: string[] = [];
  addDir(dirs, process.env.ORBIT_UPLOAD_DIR);
  addDir(dirs, PRODUCTION_UPLOAD_DIR);
  addDir(dirs, path.join(process.cwd(), "data", "uploads"));
  addDir(dirs, path.join(os.homedir(), "hostingbeyond-uploads"));
  addDir(dirs, getPublicUploadDir());
  return dirs;
}

export function getPersistentUploadDir() {
  return uploadDirCandidates()[0];
}

async function directoryIsWritable(dir: string) {
  await mkdir(dir, { recursive: true });
  const probe = path.join(dir, `.write-${process.pid}-${Date.now()}`);
  await writeFile(probe, "ok");
  await unlink(probe);
}

export async function resolveWritableUploadDir() {
  const errors: string[] = [];
  for (const dir of uploadDirCandidates()) {
    try {
      await directoryIsWritable(dir);
      return dir;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${dir} (${message})`);
    }
  }
  throw new Error(
    `No writable upload folder for the Orbit process. Tried: ${errors.join(" | ")}`,
  );
}

export function mimeFromFilename(filename: string, fallback = "") {
  const ext = path.extname(filename).toLowerCase();
  return UPLOAD_MIME[ext] || fallback;
}

export function extensionForUpload(originalName: string, mimeType: string) {
  const fromName = path.extname(originalName).toLowerCase();
  if (ALLOWED_EXT.has(fromName)) return fromName;
  const fromMime = Object.entries(UPLOAD_MIME).find(
    ([, mime]) => mime === mimeType,
  );
  return fromMime?.[0] ?? ".png";
}

export function isAllowedUpload(mimeType: string, originalName: string) {
  const mime = mimeType.toLowerCase().trim();
  if (mime && ALLOWED_MIME.has(mime)) return true;
  return ALLOWED_EXT.has(path.extname(originalName).toLowerCase());
}

export function describeUploadRejection(
  mimeType: string,
  originalName: string,
) {
  const ext = path.extname(originalName).toLowerCase() || "(no extension)";
  const mime = mimeType || "(no MIME type)";
  if (ext === ".heic" || ext === ".heif" || mime.includes("heic")) {
    return "HEIC/HEIF photos are not supported. Convert to JPG, PNG, or WebP and try again.";
  }
  return `Unsupported file type (${mime}, ${ext}). Use JPG, PNG, WebP, GIF, or SVG.`;
}

export function safeUploadFilename(filename: string) {
  const base = path.basename(filename);
  if (!/^[A-Za-z0-9._-]+$/.test(base)) return null;
  if (base.startsWith(".")) return null;
  return base;
}

export async function ensureUploadDirs() {
  const persistent = await resolveWritableUploadDir();
  const publicDir = getPublicUploadDir();
  await mkdir(persistent, { recursive: true });
  try {
    await mkdir(publicDir, { recursive: true });
  } catch {
    /* public mirror may be read-only */
  }

  // Pull every known leftover folder into the durable store so deploys
  // and NODE_ENV changes cannot 404 Orbit images on other devices.
  for (const dir of uploadDirCandidates()) {
    if (dir === persistent) continue;
    let names: string[] = [];
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    await Promise.all(
      names.map(async (name) => {
        const safe = safeUploadFilename(name);
        if (!safe || name.startsWith(".")) return;
        const from = path.join(dir, safe);
        const to = path.join(persistent, safe);
        try {
          await stat(to);
        } catch {
          try {
            const info = await stat(from);
            if (info.isFile()) await copyFile(from, to);
          } catch {
            /* skip unreadable */
          }
        }
      }),
    );
  }
}

export async function saveUploadFile(filename: string, bytes: Buffer) {
  const persistent = await resolveWritableUploadDir();
  const persistentPath = path.join(persistent, filename);
  await mkdir(persistent, { recursive: true });
  await writeFile(persistentPath, bytes);

  const mirrors = [getPublicUploadDir(), PRODUCTION_UPLOAD_DIR];
  for (const dir of mirrors) {
    if (dir === persistent) continue;
    try {
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, filename), bytes);
    } catch {
      /* extra mirrors are optional */
    }
  }
  return persistentPath;
}

export async function readUploadFile(filename: string) {
  const safe = safeUploadFilename(filename);
  if (!safe) return null;
  await ensureUploadDirs().catch(() => undefined);
  const candidates = [
    ...uploadDirCandidates().map((dir) => path.join(dir, safe)),
    path.join(getPublicUploadDir(), safe),
  ];
  for (const filePath of candidates) {
    try {
      const bytes = await readFile(filePath);
      return {
        bytes,
        mimeType: mimeFromFilename(safe, "application/octet-stream"),
      };
    } catch {
      /* try next */
    }
  }
  return null;
}

export type DiskUpload = {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  mtimeMs: number;
};

const BUNDLED_MEDIA_ROOTS: Array<{ dir: string; urlPrefix: string }> = [
  { dir: "images", urlPrefix: "/images" },
  { dir: "logo", urlPrefix: "/logo" },
  { dir: "videos", urlPrefix: "/videos" },
  { dir: "icons", urlPrefix: "/icons" },
];

async function walkMediaFiles(
  absDir: string,
  urlPrefix: string,
  seen: Map<string, DiskUpload>,
) {
  let names: string[] = [];
  try {
    names = await readdir(absDir);
  } catch {
    return;
  }
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const abs = path.join(absDir, name);
    const urlPath = `${urlPrefix}/${name}`.replace(/\\/g, "/");
    try {
      const info = await stat(abs);
      if (info.isDirectory()) {
        await walkMediaFiles(abs, urlPath, seen);
        continue;
      }
      if (!info.isFile()) continue;
      const ext = path.extname(name).toLowerCase();
      if (!UPLOAD_MIME[ext] && ext !== ".mp4" && ext !== ".webm") continue;
      if (seen.has(urlPath)) continue;
      seen.set(urlPath, {
        filename: name,
        url: urlPath,
        size: info.size,
        mimeType:
          UPLOAD_MIME[ext] ||
          (ext === ".mp4" ? "video/mp4" : ext === ".webm" ? "video/webm" : ""),
        mtimeMs: info.mtimeMs,
      });
    } catch {
      /* skip unreadable */
    }
  }
}

/** Site design files in public/ — shown in Orbit media, never deleted. */
export async function listBundledSiteMedia(): Promise<DiskUpload[]> {
  const seen = new Map<string, DiskUpload>();
  const publicRoot = path.join(process.cwd(), "public");
  for (const root of BUNDLED_MEDIA_ROOTS) {
    await walkMediaFiles(path.join(publicRoot, root.dir), root.urlPrefix, seen);
  }
  return [...seen.values()].sort((a, b) => a.url.localeCompare(b.url));
}

export async function listUploadFiles(): Promise<DiskUpload[]> {
  await ensureUploadDirs().catch(() => undefined);
  const dirs = [...uploadDirCandidates(), getPublicUploadDir()];
  const seen = new Map<string, DiskUpload>();

  for (const dir of dirs) {
    let names: string[] = [];
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (name.startsWith(".") || seen.has(name)) continue;
      const safe = safeUploadFilename(name);
      if (!safe) continue;
      try {
        const info = await stat(path.join(dir, safe));
        if (!info.isFile()) continue;
        seen.set(safe, {
          filename: safe,
          url: `/uploads/${safe}`,
          size: info.size,
          mimeType: mimeFromFilename(safe),
          mtimeMs: info.mtimeMs,
        });
      } catch {
        /* skip unreadable */
      }
    }
  }

  return [...seen.values()].sort((a, b) => b.mtimeMs - a.mtimeMs);
}
