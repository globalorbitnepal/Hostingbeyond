export async function readResponseError(
  res: Response,
  fallback = "Request failed",
) {
  const text = await res.text();
  let message = fallback;
  let details = "";

  if (text) {
    try {
      const json = JSON.parse(text) as {
        error?: string;
        details?: string;
        message?: string;
      };
      message = json.error || json.message || fallback;
      details = json.details || "";
    } catch {
      message = `${fallback} (HTTP ${res.status})`;
      details = text.slice(0, 500);
    }
  } else {
    message = `${fallback} (HTTP ${res.status} ${res.statusText})`;
  }

  return {
    message,
    details,
    status: res.status,
    text: [message, details].filter(Boolean).join("\n"),
  };
}
