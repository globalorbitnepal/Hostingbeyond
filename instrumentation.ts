export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureUploadDirs } = await import("@/lib/orbit/uploads");
  await ensureUploadDirs().catch(() => undefined);
}
