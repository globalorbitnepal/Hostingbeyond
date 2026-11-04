import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Prisma } from "@prisma/client";

import {
  hashBeyondMasterIp,
  recordBeyondMasterUsage,
} from "@/lib/beyond-master/usage";

describe("beyond master usage", () => {
  it("stores a usage row without the prompt or the raw IP", async () => {
    let saved: unknown = null;
    const result = await recordBeyondMasterUsage(
      {
        provider: "openai",
        model: "gpt-test",
        status: "success",
        ip: "203.0.113.10",
        promptTokens: 3,
        completionTokens: 4,
      },
      async (data) => {
        saved = data;
      },
    );
    assert.equal(result.stored, true);
    const row = saved as { ipHash?: string; provider: string };
    assert.equal(row.provider, "openai");
    assert.equal(JSON.stringify(saved).includes("203.0.113.10"), false);
    assert.equal(row.ipHash, hashBeyondMasterIp("203.0.113.10"));
  });

  it("reports a missing table instead of throwing", async () => {
    const result = await recordBeyondMasterUsage(
      { provider: "none", model: "none", status: "unconfigured" },
      async () => {
        throw new Prisma.PrismaClientKnownRequestError("missing", {
          code: "P2021",
          clientVersion: "test",
        });
      },
    );
    assert.equal(result.stored, false);
    assert.equal(result.reason, "table_missing");
  });
});
