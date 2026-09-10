import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "fs/promises";
import path from "path";

export const UPLOAD_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const ALLOWED_EXT = new Set(Object.keys(UPLOAD_MIME));

export function getPersistentUploadDir() {
  if (process.env.ORBIT_UPLOAD_DIR) return process.env.ORBIT_UPLOAD_DIR;
  return path.join(process.cwd(), "data", "uploads");
}

export function getPublicUploadDir() {
  return path.join(process.cwd(), "public", "uploads");
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
  if (mimeType && Object.values(UPLOAD_MIME).includes(mimeType)) return true;
  return ALLOWED_EXT.has(path.extname(originalName).toLowerCase());
}

export function safeUploadFilename(filename: string) {
  const base = path.basename(filename);
  if (!/^[A-Za-z0-9._-]+$/.test(base)) return null;
  if (base.startsWith(".")) return null;
  return base;
}

export async function ensureUploadDirs() {
  const persistent = getPersistentUploadDir();
  const publicDir = getPublicUploadDir();
  await mkdir(persistent, { recursive: true });
  await mkdir(publicDir, { recursive: true });

  // Keep a copy in the durable folder so deploys never drop files.
  try {
    const names = await readdir(publicDir);
    await Promise.all(
      names.map(async (name) => {
        if (name.startsWith(".")) return;
        const from = path.join(publicDir, name);
        const to = path.join(persistent, name);
        try {
          await stat(to);
        } catch {
          await copyFile(from, to);
        }
      }),
    );
  } catch {
    /* public dir may be empty */
  }
}

export async function saveUploadFile(filename: string, bytes: Buffer) {
  await ensureUploadDirs();
  const persistentPath = path.join(getPersistentUploadDir(), filename);
  await writeFile(persistentPath, bytes);
  try {
    await writeFile(path.join(getPublicUploadDir(), filename), bytes);
  } catch {
    /* public mirror is optional */
  }
  return persistentPath;
}

export async function readUploadFile(filename: string) {
  const safe = safeUploadFilename(filename);
  if (!safe) return null;
  const candidates = [
    path.join(getPersistentUploadDir(), safe),
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

export async function listUploadFiles(): Promise<DiskUpload[]> {
  await ensureUploadDirs();
  const dirs = [getPersistentUploadDir(), getPublicUploadDir()];
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
