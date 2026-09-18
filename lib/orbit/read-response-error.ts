function humanUploadError(status: number, raw: string, fallback: string) {
  const text = raw.trim();
  const isHtml = /^<!doctype html|<html/i.test(text);
  const tooLarge =
    status === 413 ||
    /413|entity too large|request entity too large/i.test(text);

  if (tooLarge) {
    return {
      message:
        "This image is too large for the server. Compressing and retrying is automatic — use JPG or PNG if it still fails.",
      details: "",
    };
  }

  if (isHtml) {
    return {
      message: `${fallback} (HTTP ${status}). Try again in a moment.`,
      details: "",
    };
  }

  return null;
}

export async function readResponseError(
  res: Response,
  fallback = "Request failed",
) {
  const text = await res.text();
  const mapped = humanUploadError(res.status, text, fallback);
  if (mapped) {
    return {
      message: mapped.message,
      details: mapped.details,
      status: res.status,
      text: mapped.message,
    };
  }

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
      details = text.slice(0, 180);
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
