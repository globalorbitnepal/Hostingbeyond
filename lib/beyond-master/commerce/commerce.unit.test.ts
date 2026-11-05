import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  commerceIdempotencyKey,
  createMemoryCommerceStore,
  setBeyondMasterCommerceStoreForTests,
} from "@/lib/beyond-master/commerce/store";
import { wantsDomainRegistration } from "@/lib/beyond-master/commerce/domain-register";
import { wantsNameserverChange } from "@/lib/beyond-master/commerce/nameservers";
import { wantsHostingPurchase } from "@/lib/beyond-master/commerce/hosting-checkout";
import { toolsCoverAccountReads } from "@/lib/beyond-master/tools/account-tools";

describe("commerce operations", () => {
  it("detects registration, nameserver, and hosting intents", () => {
    assert.equal(
      wantsDomainRegistration("I want to register bakery.com"),
      true,
    );
    assert.equal(
      wantsNameserverChange(
        "Update nameservers for example.com to ns1.example.com ns2.example.com",
      ),
      true,
    );
    assert.equal(wantsHostingPurchase("Buy web hosting starter plan"), true);
  });

  it("deduplicates proposals by idempotency key", async () => {
    const shared: import("@/lib/beyond-master/commerce/types").CommerceProposal[] =
      [];
    setBeyondMasterCommerceStoreForTests(createMemoryCommerceStore(shared));
    const key = commerceIdempotencyKey(
      "user-1",
      "domain_register",
      "bakery.com",
    );
    const store = createMemoryCommerceStore(shared);
    const row = {
      publicId: "abc123",
      customerUserId: "user-1",
      kind: "domain_register" as const,
      idempotencyKey: key,
      status: "pending" as const,
      expiresAt: new Date(Date.now() + 60_000),
      claimToken: null,
      payload: {
        domain: "bakery.com",
        currency: "USD",
        registerTotal: 12,
        renewPrice: 14,
        transferPrice: 12,
        termNote: "test",
        cartHref: "/cart",
      },
      resultMessage: null,
      verified: null,
      executionErrorCode: null,
    };
    const first = await store.insert(row);
    const second = await store.insert({ ...row, publicId: "other" });
    assert.equal(first.publicId, second.publicId);
    setBeyondMasterCommerceStoreForTests(null);
  });
});

describe("account tool deduplication helper", () => {
  it("marks account reads covered by tool calls", () => {
    assert.equal(
      toolsCoverAccountReads([{ tool: "get_my_invoices", args: {} }]),
      true,
    );
    assert.equal(
      toolsCoverAccountReads([{ tool: "get_hosting_plans", args: {} }]),
      false,
    );
  });
});
