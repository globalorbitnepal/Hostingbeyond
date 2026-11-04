import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { consumeRateLimit } from "@/lib/http/fixed-window-rate-limit";
import { BEYOND_MASTER_BUILTIN_ARTICLES } from "@/lib/beyond-master/knowledge/articles";
import { retrieveBeyondMasterKnowledge } from "@/lib/beyond-master/knowledge/retrieve";
import { parseBeyondMasterChatRequest } from "@/lib/beyond-master/request";
import {
  adminSecurityAudit,
  createMemorySecurityRepository,
  setBeyondMasterSecurityRepositoryForTests,
  type SecurityEvent,
} from "@/lib/beyond-master/security-audit";
import { decideOrbitSessionTrust } from "@/lib/orbit/session-trust";

const now = new Date("2026-11-03T12:00:00.000Z");

function event(
  overrides: Partial<SecurityEvent> &
    Pick<SecurityEvent, "id" | "category" | "action">,
): SecurityEvent {
  return {
    createdAt: now.toISOString(),
    resourceRef: "example.com",
    status: "accepted",
    description: "Safe description",
    ...overrides,
  };
}

afterEach(() => {
  setBeyondMasterSecurityRepositoryForTests(null);
});

describe("beyond master security audit", () => {
  it("rejects an anonymous admin before repository access", async () => {
    let called = false;
    const memory = createMemorySecurityRepository({});
    setBeyondMasterSecurityRepositoryForTests({
      ...memory,
      dns: async () => {
        called = true;
        throw new Error("database should not be touched");
      },
    });
    const denied = await adminSecurityAudit(
      null,
      new Request("http://localhost/api/orbit/beyond-master/security"),
    );
    assert.equal(denied.status, 401);
    assert.equal(called, false);
  });

  it("documents expired and database-unavailable admin session decisions", () => {
    assert.deepEqual(
      decideOrbitSessionTrust({
        jwtValid: false,
        hasAdminUserId: false,
        databaseUnavailable: false,
        sessionFound: false,
        sessionExpired: false,
      }),
      { outcome: "reject", reason: "jwt_invalid" },
    );
    assert.deepEqual(
      decideOrbitSessionTrust({
        jwtValid: true,
        hasAdminUserId: true,
        databaseUnavailable: false,
        sessionFound: true,
        sessionExpired: true,
      }),
      { outcome: "reject", reason: "session_expired" },
    );
    const unavailable = decideOrbitSessionTrust({
      jwtValid: true,
      hasAdminUserId: true,
      databaseUnavailable: true,
      sessionFound: false,
      sessionExpired: false,
    });
    assert.equal(unavailable.outcome, "reject");
    if (unavailable.outcome === "reject")
      assert.equal(unavailable.reason, "database_unavailable");
    const missingRow = decideOrbitSessionTrust({
      jwtValid: true,
      hasAdminUserId: true,
      databaseUnavailable: false,
      sessionFound: false,
      sessionExpired: false,
    });
    assert.equal(missingRow.outcome, "reject");
    if (missingRow.outcome === "reject")
      assert.equal(missingRow.reason, "session_missing");
  });

  it("paginates safe events and marks a missing source unavailable", async () => {
    const usage: SecurityEvent[] = [
      event({
        id: "u1",
        category: "usage",
        action: "account_read",
        status: "account_read",
        description: "Account read",
        resourceRef: "openai",
      }),
      event({
        id: "u2",
        category: "usage",
        action: "error",
        status: "upstream",
        description: "Provider request failed",
        resourceRef: "openai",
      }),
      event({
        id: "u3",
        category: "usage",
        action: "timeout",
        status: "timeout",
        description: "Timed out",
        resourceRef: "openai",
      }),
    ];
    setBeyondMasterSecurityRepositoryForTests(
      createMemorySecurityRepository({
        dns: [
          event({
            id: "d1",
            category: "dns",
            action: "add",
            description: "DNS add on example.com",
            resourceRef: "example.com",
          }),
        ],
        usage,
        authentication: [
          event({
            id: "a1",
            category: "authentication",
            action: "LOGIN",
            status: "LOGIN",
            description: "Orbit login",
            resourceRef: null,
          }),
        ],
        missing: ["ticket"],
      }),
    );
    const params = new URLSearchParams({
      from: "2026-11-01T00:00:00.000Z",
      to: "2026-11-03T23:59:59.000Z",
      pageSize: "2",
    });
    const response = await adminSecurityAudit(
      "admin-1",
      new Request(
        `http://localhost/api/orbit/beyond-master/security?${params}`,
      ),
    );
    const body = (await response.json()) as {
      sections: {
        tickets: { available: boolean; message?: string; count?: number };
        accountReads: { count: number };
        aiFailures: { count: number };
        dns: { count: number };
      };
      events: { description: string }[];
      total: number;
      pageSize: number;
      rateLimit: { scope: string };
    };
    assert.equal(body.sections.tickets.available, false);
    assert.match(body.sections.tickets.message ?? "", /ticket migration/);
    assert.equal("count" in body.sections.tickets, false);
    assert.equal(body.sections.dns.count, 1);
    assert.equal(body.sections.accountReads.count, 1);
    assert.equal(body.sections.aiFailures.count, 2);
    assert.equal(body.pageSize, 2);
    assert.equal(body.events.length, 2);
    assert.equal(body.total, 5);
    assert.equal(body.rateLimit.scope, "process-local");
    const encoded = JSON.stringify(body);
    assert.equal(encoded.includes("sk-"), false);
    assert.equal(encoded.includes("sourceNote"), false);
    assert.equal(encoded.includes("claimToken"), false);

    const invalid = await adminSecurityAudit(
      "admin-1",
      new Request(
        "http://localhost/api/orbit/beyond-master/security?category=secrets",
      ),
    );
    assert.equal(invalid.status, 400);
    const oversized = await adminSecurityAudit(
      "admin-1",
      new Request(
        "http://localhost/api/orbit/beyond-master/security?pageSize=51",
      ),
    );
    assert.equal(oversized.status, 400);
  });

  it("keeps customer identity, knowledge notes, and rate limits bounded", () => {
    const chat = parseBeyondMasterChatRequest({
      customerId: "someone-else",
      messages: [{ role: "user", content: "Show my invoices." }],
    });
    assert.equal(chat.ok, false);

    const dns = BEYOND_MASTER_BUILTIN_ARTICLES.find(
      (article) => article.category === "dns",
    );
    assert.ok(dns);
    const retrieved = retrieveBeyondMasterKnowledge(
      "How do I add an MX record and SPF TXT?",
      [
        { ...dns, sourceNote: "operator only note" } as typeof dns & {
          sourceNote: string;
        },
      ],
    );
    const encoded = JSON.stringify(retrieved);
    assert.equal(encoded.includes("sourceNote"), false);
    assert.equal(encoded.includes("operator only note"), false);

    const key = `security-phase-8f-${now.getTime()}`;
    assert.equal(consumeRateLimit(key, 2, 60_000), true);
    assert.equal(consumeRateLimit(key, 2, 60_000), true);
    assert.equal(consumeRateLimit(key, 2, 60_000), false);
    assert.equal(consumeRateLimit(`${key}-other`, 2, 60_000), true);
  });
});
