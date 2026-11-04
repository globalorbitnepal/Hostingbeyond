import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildUsageAnalytics,
  parseUsageQuery,
  protectCustomerRef,
  respondToBeyondMasterUsage,
  type UsageFacts,
} from "@/lib/beyond-master/usage-analytics";

const now = new Date("2026-11-03T12:00:00.000Z");

const stored: UsageFacts = {
  available: true,
  statuses: [
    { status: "success", count: 4 },
    { status: "error", count: 1 },
    { status: "timeout", count: 1 },
    { status: "account_read", count: 3 },
    { status: "unconfigured", count: 2 },
    { status: "rate_limited", count: 1 },
    { status: "aborted", count: 1 },
  ],
  providers: [
    { provider: "openai", status: "success", count: 4 },
    { provider: "openai", status: "error", count: 1 },
    { provider: "none", status: "unconfigured", count: 2 },
  ],
  models: [
    { model: "gpt-test", status: "success", count: 4 },
    { model: "gpt-test", status: "error", count: 1 },
    { model: "none", status: "account_read", count: 3 },
  ],
  days: [
    { day: "2026-11-02", status: "success", count: 4 },
    { day: "2026-11-02", status: "account_read", count: 3 },
    { day: "2026-11-03", status: "error", count: 1 },
  ],
  customers: [{ customerUserId: "cust_alice_12345678", count: 5 }],
  rows: [
    {
      id: "row-1",
      createdAt: "2026-11-03T10:00:00.000Z",
      provider: "openai",
      model: "gpt-test",
      status: "success",
      latencyMs: 9000,
      promptTokens: 10,
      completionTokens: 4,
      customerUserId: "cust_alice_12345678",
      errorCode: null,
    },
  ],
  totalRows: 13,
  averageLatencyMs: 400,
  latencySamples: 6,
  slowCount: 1,
  slowRows: [],
  promptTokens: 10,
  promptTokenRows: 1,
  completionTokens: 4,
  completionTokenRows: 1,
  dnsAvailable: true,
  dns: [
    { status: "pending", providerStatus: null, verified: null, count: 2 },
    {
      status: "executed",
      providerStatus: "accepted",
      verified: true,
      count: 1,
    },
    {
      status: "executed",
      providerStatus: "accepted",
      verified: null,
      count: 1,
    },
    { status: "failed", providerStatus: "uncertain", verified: null, count: 1 },
  ],
};

describe("beyond master usage analytics", () => {
  it("rejects an anonymous request before loading rows", async () => {
    let loaded = false;
    const response = await respondToBeyondMasterUsage({
      admin: null,
      params: new URLSearchParams(),
      now,
      load: async () => {
        loaded = true;
        return { available: false };
      },
    });
    assert.equal(response.status, 401);
    assert.equal(loaded, false);
    assert.equal(JSON.stringify(response.body).includes("sk-"), false);
  });

  it("returns migration pending without zero statistics", () => {
    const parsed = parseUsageQuery(new URLSearchParams("range=7d"), now);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const body = buildUsageAnalytics(parsed.query, { available: false });
    assert.equal(body.available, false);
    if (!body.available) assert.match(body.message, /migration/);
    assert.equal("summary" in body, false);
    assert.equal(JSON.stringify(body).includes("0"), false);
  });

  it("returns a safe error when the database fails and does not leak the driver message", async () => {
    const response = await respondToBeyondMasterUsage({
      admin: { id: "admin-1" },
      params: new URLSearchParams("range=24h"),
      now,
      load: async () => {
        throw new Error("password authentication failed for user postgres");
      },
    });
    assert.equal(response.status, 503);
    assert.equal(JSON.stringify(response.body).includes("postgres"), false);
  });

  it("separates AI success from account reads, failures, unconfigured calls, and DNS proposals", () => {
    const parsed = parseUsageQuery(new URLSearchParams("range=30d"), now);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const body = buildUsageAnalytics(parsed.query, stored);
    assert.equal(body.available, true);
    if (!body.available) return;
    assert.equal(body.summary.successfulAi, 4);
    assert.equal(body.summary.failed, 2);
    assert.equal(body.summary.accountReads, 3);
    assert.equal(body.summary.unconfigured, 2);
    assert.equal(body.summary.totalRequests, 13);
    assert.notEqual(body.summary.successfulAi, body.summary.totalRequests);
    const openai = body.providers.find((row) => row.provider === "openai");
    assert.equal(openai?.successfulAi, 4);
    assert.equal(openai?.failed, 1);
    assert.equal(openai?.requests, 5);
    const model = body.models.find((row) => row.model === "gpt-test");
    assert.equal(model?.successfulAi, 4);
    assert.equal(model?.requests, 5);
    assert.equal(body.daily[0]?.successfulAi, 4);
    assert.equal(body.daily[0]?.accountReads, 3);
    assert.equal(body.tokens.totalTokens, 14);
    assert.equal(body.customers[0]?.customerRef, "cust…5678");
    assert.equal(JSON.stringify(body).includes("cust_alice_12345678"), false);
    assert.equal(body.dns.available, true);
    if (body.dns.available) {
      assert.equal(body.dns.proposals, 5);
      assert.equal(body.dns.executedVerified, 1);
      assert.equal(body.dns.acceptedUnverified, 1);
      assert.equal(body.dns.uncertain, 1);
      assert.notEqual(body.dns.executedVerified, body.dns.proposals);
    }
    assert.equal(JSON.stringify(body).includes("ipHash"), false);
    assert.equal(JSON.stringify(body).includes("prompt"), true);
    assert.equal(JSON.stringify(body).includes("sk-"), false);
  });

  it("does not count a missing DNS table as zero executed writes", () => {
    const parsed = parseUsageQuery(new URLSearchParams("range=7d"), now);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const body = buildUsageAnalytics(parsed.query, {
      ...stored,
      dnsAvailable: false,
      dns: [],
    });
    assert.equal(body.available, true);
    if (!body.available || body.dns.available) return;
    assert.match(body.dns.message, /proposal migration/);
    assert.equal("executedVerified" in body.dns, false);
  });

  it("rejects an oversized page and a range longer than 90 days before loading", async () => {
    let loaded = false;
    const page = await respondToBeyondMasterUsage({
      admin: { id: "admin-1" },
      params: new URLSearchParams("pageSize=51"),
      now,
      load: async () => {
        loaded = true;
        return { available: false };
      },
    });
    assert.equal(page.status, 400);
    const range = await respondToBeyondMasterUsage({
      admin: { id: "admin-1" },
      params: new URLSearchParams(
        "range=custom&from=2026-01-01T00:00:00.000Z&to=2026-06-01T00:00:00.000Z",
      ),
      now,
      load: async () => {
        loaded = true;
        return { available: false };
      },
    });
    assert.equal(range.status, 400);
    assert.equal(loaded, false);
  });

  it("keeps an empty stored range empty instead of inventing rows", () => {
    const parsed = parseUsageQuery(
      new URLSearchParams("range=24h&provider=openai"),
      now,
    );
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.query.provider, "openai");
    const body = buildUsageAnalytics(parsed.query, {
      available: true,
      statuses: [],
      providers: [],
      models: [],
      days: [],
      customers: [],
      rows: [],
      totalRows: 0,
      averageLatencyMs: null,
      latencySamples: 0,
      slowCount: 0,
      slowRows: [],
      promptTokens: null,
      promptTokenRows: 0,
      completionTokens: null,
      completionTokenRows: 0,
      dnsAvailable: false,
      dns: [],
    });
    assert.equal(body.available, true);
    if (!body.available) return;
    assert.equal(body.empty, true);
    assert.equal(body.summary.totalRequests, 0);
    assert.equal(body.summary.successfulAi, 0);
    assert.equal(body.daily.length, 0);
    assert.equal(body.tokens.totalTokens, null);
    assert.equal(body.rows.length, 0);
  });

  it("hides email-shaped customer identifiers", () => {
    assert.equal(protectCustomerRef("person@example.com"), "customer");
  });
});
