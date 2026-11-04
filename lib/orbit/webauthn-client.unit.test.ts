import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  enrollOrbitPasskey,
  signInWithOrbitPasskey,
} from "@/lib/orbit/webauthn-client";

const secret = "staging-enrollment-secret";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("orbit passkey client", () => {
  it("sends the enrollment secret only to the existing registration routes", async () => {
    const calls: Array<{
      url: string;
      body: { enrollmentSecret?: string; response?: { id?: string } };
    }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        enrollmentSecret?: string;
        response?: { id?: string };
      };
      calls.push({ url, body });
      if (url.endsWith("/register/options")) {
        return jsonResponse(200, { options: { challenge: "Y2hhbGxlbmdl" } });
      }
      return jsonResponse(200, { ok: true });
    };

    const result = await enrollOrbitPasskey({
      enrollmentSecret: secret,
      fetchImpl,
      createCredential: async (options) => {
        assert.deepEqual(options, { challenge: "Y2hhbGxlbmdl" });
        return { id: "credential", response: { clientDataJSON: "e30" } };
      },
    });

    assert.deepEqual(result, { ok: true });
    assert.deepEqual(
      calls.map((call) => call.url),
      ["/api/orbit/auth/register/options", "/api/orbit/auth/register/verify"],
    );
    assert.equal(calls[0].body.enrollmentSecret, secret);
    assert.equal(calls[1].body.enrollmentSecret, secret);
    assert.equal(calls[1]?.body.response?.id, "credential");
    assert.equal(JSON.stringify(calls[1].body).includes("accessKey"), false);
  });

  it("stops when the server rejects a second passkey and does not open the browser prompt", async () => {
    let prompted = false;
    const result = await enrollOrbitPasskey({
      enrollmentSecret: secret,
      fetchImpl: async () =>
        jsonResponse(409, {
          error: "Passkey already enrolled. Use Continue with Passkey.",
        }),
      createCredential: async () => {
        prompted = true;
        return {};
      },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.message.includes(secret), false);
      assert.match(result.message, /already enrolled/i);
    }
    assert.equal(prompted, false);
  });

  it("does not repeat an enrollment secret that a response echoes", async () => {
    const result = await enrollOrbitPasskey({
      enrollmentSecret: secret,
      fetchImpl: async () => jsonResponse(403, { error: `Invalid ${secret}` }),
      createCredential: async () => ({}),
    });
    assert.deepEqual(result, {
      ok: false,
      message: "Passkey enrollment could not start.",
    });
  });

  it("reports a dismissed browser prompt without calling verify", async () => {
    const calls: string[] = [];
    const result = await enrollOrbitPasskey({
      enrollmentSecret: secret,
      fetchImpl: async (input) => {
        calls.push(String(input));
        return jsonResponse(200, { options: { challenge: "Y2hhbGxlbmdl" } });
      },
      createCredential: async () => {
        const error = new Error("dismissed");
        error.name = "NotAllowedError";
        throw error;
      },
    });
    assert.deepEqual(result, {
      ok: false,
      message: "The passkey prompt was dismissed.",
    });
    assert.deepEqual(calls, ["/api/orbit/auth/register/options"]);
  });

  it("signs in through the login routes without an enrollment secret", async () => {
    const bodies: unknown[] = [];
    const result = await signInWithOrbitPasskey({
      fetchImpl: async (input, init) => {
        bodies.push(init?.body ? JSON.parse(String(init.body)) : null);
        if (String(input).endsWith("/login/options")) {
          return jsonResponse(200, { options: { challenge: "bG9naW4" } });
        }
        return jsonResponse(200, { ok: true });
      },
      getCredential: async (options) => {
        assert.deepEqual(options, { challenge: "bG9naW4" });
        return { id: "credential" };
      },
    });
    assert.deepEqual(result, { ok: true });
    assert.equal(JSON.stringify(bodies).includes("enrollmentSecret"), false);
    assert.equal(JSON.stringify(bodies).includes(secret), false);
  });

  it("leaves the access-key form in place", () => {
    const source = readFileSync("components/orbit/login-form.tsx", "utf8");
    assert.equal(source.includes('fetch("/api/orbit/auth/access"'), true);
    assert.equal(source.includes("<OrbitPasskeyPanel />"), true);
  });
});
