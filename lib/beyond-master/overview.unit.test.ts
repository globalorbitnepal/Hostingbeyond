import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildBeyondMasterOverview,
  respondToBeyondMasterOverview,
  USAGE_MIGRATION_MESSAGE,
  type OverviewFacts,
} from "@/lib/beyond-master/overview";

const pendingFacts: OverviewFacts = {
  usageTable: false,
  knowledgeTable: false,
  ticketTable: false,
  dnsTable: false,
  requests: [],
  providers: [],
  averageLatencyMs: null,
  dnsExecuted: null,
};

describe("beyond master orbit overview", () => {
  it("hides the API key and does not invent usage while migrations are pending", () => {
    const secret = "sk-orbit-overview-secret";
    const overview = buildBeyondMasterOverview(
      {
        BEYOND_MASTER_AI_PROVIDER: "openai",
        BEYOND_MASTER_AI_MODEL: "gpt-test",
        BEYOND_MASTER_AI_API_KEY: secret,
      },
      pendingFacts,
    );
    const encoded = JSON.stringify(overview);
    assert.equal(encoded.includes(secret), false);
    assert.equal(encoded.includes('"apiKey"'), false);
    assert.equal(overview.ai.apiKeyConfigured, "Yes");
    assert.equal(overview.ai.provider, "openai");
    assert.equal(overview.usage.available, false);
    if (!overview.usage.available)
      assert.equal(overview.usage.message, USAGE_MIGRATION_MESSAGE);
    assert.equal(
      overview.modules.find((item) => item.name === "Usage Tracking")?.status,
      "Migration Pending",
    );
    assert.equal(
      overview.modules.find((item) => item.name === "Support Tickets")?.status,
      "Migration Pending",
    );
    assert.equal(
      overview.modules.find((item) => item.name === "DNS Automation")?.status,
      "Migration Pending",
    );
    assert.equal(
      overview.modules.find((item) => item.name === "Knowledge Base")?.status,
      "Read-only",
    );
    assert.equal(
      overview.modules.find((item) => item.name === "AI Provider")?.status,
      "Configured",
    );
  });

  it("reports stored totals without treating every status as success", () => {
    const overview = buildBeyondMasterOverview(
      {},
      {
        ...pendingFacts,
        usageTable: true,
        dnsTable: false,
        requests: [
          { status: "success", count: 4 },
          { status: "error", count: 1 },
          { status: "timeout", count: 1 },
          { status: "account_read", count: 2 },
          { status: "unconfigured", count: 3 },
        ],
        providers: [{ provider: "openai", count: 11 }],
        averageLatencyMs: 120.4,
      },
    );
    assert.equal(overview.usage.available, true);
    if (overview.usage.available) {
      assert.equal(overview.usage.totalRequests, 11);
      assert.equal(overview.usage.successfulRequests, 4);
      assert.equal(overview.usage.failedRequests, 2);
      assert.equal(overview.usage.accountReads, 2);
      assert.equal(overview.usage.dnsOperations, null);
      assert.match(overview.usage.dnsMessage ?? "", /proposal migration/);
      assert.deepEqual(overview.usage.providers, [
        { provider: "openai", requests: 11 },
      ]);
    }
  });

  it("rejects an overview request without an Orbit admin and does not read facts", async () => {
    let read = false;
    const response = await respondToBeyondMasterOverview({
      admin: null,
      loadFacts: async () => {
        read = true;
        return pendingFacts;
      },
    });
    assert.equal(response.status, 401);
    assert.equal(read, false);
    assert.equal(JSON.stringify(response.body).includes("sk-"), false);
  });

  it("returns the mocked summary for an authenticated admin", async () => {
    const secret = "sk-admin-response-secret";
    const response = await respondToBeyondMasterOverview({
      admin: { id: "admin-1" },
      env: {
        BEYOND_MASTER_AI_PROVIDER: "openai",
        BEYOND_MASTER_AI_MODEL: "gpt-test",
        BEYOND_MASTER_AI_API_KEY: secret,
      },
      loadFacts: async () => pendingFacts,
    });
    assert.equal(response.status, 200);
    if (response.status === 200) {
      assert.equal(response.body.ai.apiKeyConfigured, "Yes");
      assert.equal(response.body.usage.available, false);
      assert.equal(JSON.stringify(response.body).includes(secret), false);
    }
  });
});
