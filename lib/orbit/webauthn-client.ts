export type WebAuthnCeremony = (options: unknown) => Promise<unknown>;

type ErrorBody = { error?: unknown };

export async function enrollOrbitPasskey(input: {
  enrollmentSecret: string;
  fetchImpl: typeof fetch;
  createCredential: WebAuthnCeremony;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const secret = input.enrollmentSecret.trim();
  if (!secret) return { ok: false, message: "Enrollment secret is required." };

  const started = await input.fetchImpl("/api/orbit/auth/register/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enrollmentSecret: secret }),
  });
  const startedBody = (await readJson(started)) as ErrorBody & {
    options?: unknown;
  };
  if (!started.ok || startedBody.options == null) {
    return {
      ok: false,
      message: publicMessage(
        startedBody,
        secret,
        "Passkey enrollment could not start.",
      ),
    };
  }

  let credential: unknown;
  try {
    credential = await input.createCredential(startedBody.options);
  } catch (error) {
    return { ok: false, message: ceremonyMessage(error) };
  }

  const verified = await input.fetchImpl("/api/orbit/auth/register/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enrollmentSecret: secret, response: credential }),
  });
  const verifiedBody = (await readJson(verified)) as ErrorBody;
  if (!verified.ok) {
    return {
      ok: false,
      message: publicMessage(
        verifiedBody,
        secret,
        "Passkey enrollment failed.",
      ),
    };
  }
  return { ok: true };
}

export async function signInWithOrbitPasskey(input: {
  fetchImpl: typeof fetch;
  getCredential: WebAuthnCeremony;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const started = await input.fetchImpl("/api/orbit/auth/login/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const startedBody = (await readJson(started)) as ErrorBody & {
    options?: unknown;
  };
  if (!started.ok || startedBody.options == null) {
    return {
      ok: false,
      message: publicMessage(
        startedBody,
        "",
        "Passkey sign-in could not start.",
      ),
    };
  }

  let credential: unknown;
  try {
    credential = await input.getCredential(startedBody.options);
  } catch (error) {
    return { ok: false, message: ceremonyMessage(error) };
  }

  const verified = await input.fetchImpl("/api/orbit/auth/login/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response: credential }),
  });
  const verifiedBody = (await readJson(verified)) as ErrorBody;
  if (!verified.ok) {
    return {
      ok: false,
      message: publicMessage(verifiedBody, "", "Passkey sign-in failed."),
    };
  }
  return { ok: true };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function publicMessage(body: ErrorBody, secret: string, fallback: string) {
  const message =
    typeof body.error === "string" && body.error.trim() ? body.error : fallback;
  if (secret && message.includes(secret)) return fallback;
  return message;
}

function ceremonyMessage(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "AbortError") {
    return "The passkey prompt was dismissed.";
  }
  return "The browser could not use a passkey.";
}
