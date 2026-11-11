export async function profileAction<T = Record<string, unknown>>(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string; data: T }> {
  const res = await fetch("/api/account/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    return { ok: false, error: data.error ?? "Could not save.", data };
  }
  return { ok: true, data };
}
