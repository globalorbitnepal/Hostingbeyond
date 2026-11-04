import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  adminGetDns,
  adminListDns,
  adminListDnsAudit,
  createMemoryDnsReadRepository,
  DNS_UNCERTAIN_EXPLANATION,
  setBeyondMasterDnsReadRepositoryForTests,
} from "@/lib/beyond-master/dns/admin-read";

const customerId = "cust_dns_12345678";

function proposal(overrides: Record<string, unknown> = {}) {
  return {
    publicId: "dns_alpha01",
    customerUserId: customerId,
    domain: "example.com",
    action: "add",
    recordType: "A",
    host: "www",
    value: "203.0.113.10",
    ttl: 3600,
    priority: null,
    recordId: null,
    snapshot: {
      type: "A",
      host: "www",
      value: "203.0.113.9",
      ttl: 3600,
      distance: 0,
      apiKey: "sk-live-secret",
    },
    status: "executed",
    expiresAt: "2026-11-03T12:00:00.000Z",
    claimToken: "claim-secret-token",
    providerStatus: "accepted",
    verified: true,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-02T00:00:00.000Z",
    ...overrides,
  };
}

afterEach(() => {
  setBeyondMasterDnsReadRepositoryForTests(null);
});

describe("orbit dns read dashboard", () => {
  it("rejects an anonymous request before the repository is called", async () => {
    let called = false;
    setBeyondMasterDnsReadRepositoryForTests({
      ...createMemoryDnsReadRepository(),
      list: async () => {
        called = true;
        throw new Error("database should not be touched");
      },
    });
    const denied = await adminListDns(
      null,
      new Request("http://localhost/api/orbit/beyond-master/dns"),
    );
    assert.equal(denied.status, 401);
    assert.equal(called, false);
  });

  it("reports a missing migration without counts", async () => {
    setBeyondMasterDnsReadRepositoryForTests({
      ...createMemoryDnsReadRepository(),
      list: async () => ({
        ok: false,
        status: 503,
        code: "migration_pending",
        error:
          "DNS management is unavailable until the database migration is applied.",
      }),
    });
    const response = await adminListDns(
      "admin-1",
      new Request("http://localhost/api/orbit/beyond-master/dns"),
    );
    const body = (await response.json()) as {
      available: boolean;
      message: string;
    };
    assert.equal(body.available, false);
    assert.equal(
      body.message,
      "DNS management is unavailable until the database migration is applied.",
    );
    assert.equal("counts" in body, false);
  });

  it("paginates, filters, and hides secrets", async () => {
    const rows = [
      proposal(),
      proposal({
        publicId: "dns_beta0002",
        domain: "other.net",
        host: "mail",
        recordType: "MX",
        status: "pending",
        providerStatus: null,
        verified: null,
        createdAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-10-02T00:00:00.000Z",
      }),
      proposal({
        publicId: "dns_gamma003",
        status: "executed",
        providerStatus: "accepted",
        verified: null,
        updatedAt: "2026-11-02T01:00:00.000Z",
      }),
      proposal({
        publicId: "dns_delta004",
        status: "failed",
        providerStatus: "uncertain",
        verified: null,
        updatedAt: "2026-11-02T02:00:00.000Z",
      }),
      proposal({
        publicId: "dns_echo0005",
        status: "failed",
        providerStatus: "rejected",
        verified: false,
      }),
    ];
    const repository = createMemoryDnsReadRepository({
      proposals: rows,
      audits: [
        {
          id: "auditbeyond1",
          action: "BEYOND_MASTER_DNS",
          resourceId: "dns_alpha01",
          createdAt: "2026-11-02T00:00:00.000Z",
          details: {
            domain: "example.com",
            proposalId: "dns_alpha01",
            action: "add",
            recordType: "A",
            previous: {
              type: "A",
              host: "www",
              value: "203.0.113.9",
              ttl: 3600,
              distance: 0,
            },
            next: {
              type: "A",
              host: "www",
              value: "203.0.113.10",
              ttl: 3600,
              priority: null,
            },
            providerStatus: "accepted",
            verified: true,
            customerUserId: customerId,
            claimToken: "claim-secret-token",
            apiKey: "sk-live-secret",
          },
        },
        {
          id: "auditother01",
          action: "DOMAIN_RENEW",
          resourceId: "dns_alpha01",
          createdAt: "2026-11-02T03:00:00.000Z",
          details: { domain: "example.com", secret: "wallet-token" },
        },
      ],
    });
    assert.deepEqual(Object.keys(repository).sort(), ["audit", "get", "list"]);
    setBeyondMasterDnsReadRepositoryForTests(repository);

    let reads = 0;
    setBeyondMasterDnsReadRepositoryForTests({
      ...repository,
      list: async (input) => {
        reads += 1;
        return repository.list(input);
      },
    });
    const tooBig = await adminListDns(
      "admin-1",
      new Request("http://localhost/api/orbit/beyond-master/dns?pageSize=51"),
    );
    assert.equal(tooBig.status, 400);
    assert.equal(reads, 0);

    const page = await adminListDns(
      "admin-1",
      new Request(
        "http://localhost/api/orbit/beyond-master/dns?page=1&pageSize=2",
      ),
    );
    const listed = (await page.json()) as {
      proposals: { publicId: string; customerRef: string }[];
      total: number;
      pageSize: number;
      counts: {
        total: number;
        verifiedSuccess: number;
        acceptedUnverified: number;
        uncertain: number;
        rejected: number;
      };
    };
    assert.equal(listed.pageSize, 2);
    assert.equal(listed.proposals.length, 2);
    assert.equal(listed.total, 5);
    assert.equal(listed.counts.verifiedSuccess, 1);
    assert.equal(listed.counts.acceptedUnverified, 1);
    assert.equal(listed.counts.uncertain, 1);
    assert.equal(listed.counts.rejected, 1);
    assert.equal(
      listed.proposals.some(
        (item) =>
          item.customerRef.includes("@") || item.customerRef === customerId,
      ),
      false,
    );

    const byDomain = await adminListDns(
      "admin-1",
      new Request("http://localhost/api/orbit/beyond-master/dns?q=other.net"),
    );
    assert.equal(
      ((await byDomain.json()) as { proposals: { publicId: string }[] })
        .proposals[0]?.publicId,
      "dns_beta0002",
    );
    const byReference = await adminListDns(
      "admin-1",
      new Request("http://localhost/api/orbit/beyond-master/dns?q=dns_alpha01"),
    );
    assert.equal(((await byReference.json()) as { total: number }).total, 1);
    const byStatus = await adminListDns(
      "admin-1",
      new Request(
        "http://localhost/api/orbit/beyond-master/dns?status=pending",
      ),
    );
    assert.equal(
      ((await byStatus.json()) as { proposals: { publicId: string }[] })
        .proposals[0]?.publicId,
      "dns_beta0002",
    );
    const byType = await adminListDns(
      "admin-1",
      new Request("http://localhost/api/orbit/beyond-master/dns?type=MX"),
    );
    assert.equal(((await byType.json()) as { total: number }).total, 1);
    const byCustomer = await adminListDns(
      "admin-1",
      new Request(
        "http://localhost/api/orbit/beyond-master/dns?customer=12345678",
      ),
    );
    assert.equal(((await byCustomer.json()) as { total: number }).total, 5);
    const badDate = await adminListDns(
      "admin-1",
      new Request(
        "http://localhost/api/orbit/beyond-master/dns?from=not-a-date",
      ),
    );
    assert.equal(badDate.status, 400);

    const before = rows.find((row) => row.publicId === "dns_delta004")?.status;
    const detail = await adminGetDns("admin-1", "dns_delta004");
    const detailBody = await detail.json();
    const encoded = JSON.stringify(detailBody);
    assert.equal(encoded.includes("claim-secret-token"), false);
    assert.equal(encoded.includes("sk-live"), false);
    assert.equal(encoded.includes("apiKey"), false);
    assert.equal(encoded.includes(customerId), false);
    assert.equal(
      (
        detailBody as {
          proposal: { uncertainExplanation: string; status: string };
        }
      ).proposal.uncertainExplanation,
      DNS_UNCERTAIN_EXPLANATION,
    );
    assert.equal(
      (detailBody as { proposal: { status: string } }).proposal.status,
      before,
    );
    assert.equal(
      rows.find((row) => row.publicId === "dns_delta004")?.status,
      "failed",
    );

    const verified = await adminGetDns("admin-1", "dns_alpha01");
    const verifiedBody = (await verified.json()) as {
      proposal: { verification: string };
      audit: { id: string }[];
    };
    assert.equal(verifiedBody.proposal.verification, "verified");
    assert.deepEqual(
      verifiedBody.audit.map((item) => item.id),
      ["auditbeyond1"],
    );
    const audit = await adminListDnsAudit(
      "admin-1",
      new Request("http://localhost/api/orbit/beyond-master/dns/audit"),
    );
    const auditBody = JSON.stringify(await audit.json());
    assert.equal(auditBody.includes("DOMAIN_RENEW"), false);
    assert.equal(auditBody.includes("wallet-token"), false);
    assert.equal(auditBody.includes("claim-secret-token"), false);
  });
});
