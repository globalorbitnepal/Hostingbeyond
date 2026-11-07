import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import {
  type CommerceAuditEntry,
  setCommerceAuditForTests,
} from "@/lib/beyond-master/commerce/audit";
import { confirmDomainRegistrationProposal } from "@/lib/beyond-master/commerce/domain-register";
import { confirmHostingCheckoutProposal } from "@/lib/beyond-master/commerce/hosting-checkout";
import { confirmNameserverProposal } from "@/lib/beyond-master/commerce/nameservers";
import {
  commerceIdempotencyKey,
  commerceProposalPublicId,
  createMemoryCommerceStore,
  setBeyondMasterCommerceStoreForTests,
} from "@/lib/beyond-master/commerce/store";
import type { CommerceProposal } from "@/lib/beyond-master/commerce/types";
import { beginCommerceConfirm } from "@/lib/beyond-master/commerce/workflow";
import {
  hostingOrderCustomerReference,
  toCustomerHostingOrderSummary,
} from "@/lib/hosting/customer-hosting-orders";
import type { HostingOrder } from "@prisma/client";

function sampleProposal(
  overrides?: Partial<CommerceProposal>,
): CommerceProposal {
  return {
    publicId: commerceProposalPublicId(),
    customerUserId: "user-a",
    kind: "nameserver_update",
    idempotencyKey: commerceIdempotencyKey(
      "user-a",
      "nameserver_update",
      "example.com:ns1.example.com,ns2.example.com",
    ),
    status: "pending",
    expiresAt: new Date(Date.now() + 60_000),
    claimToken: null,
    payload: {
      domain: "example.com",
      current: ["old.ns.example"],
      proposed: ["ns1.example.com", "ns2.example.com"],
    },
    resultMessage: null,
    verified: null,
    executionErrorCode: null,
    ...overrides,
  };
}

function useMemoryStore() {
  const shared: CommerceProposal[] = [];
  const store = createMemoryCommerceStore(shared);
  setBeyondMasterCommerceStoreForTests(store);
  return { shared, store };
}

describe("commerce proposal persistence", () => {
  afterEach(() => {
    setBeyondMasterCommerceStoreForTests(null);
    setCommerceAuditForTests(null);
  });

  it("survives simulated process restart via shared backing store", async () => {
    const { shared, store } = useMemoryStore();
    setCommerceAuditForTests(async () => undefined);
    const proposal = sampleProposal();
    await store.insert(proposal);
    const restarted = createMemoryCommerceStore(shared);
    const loaded = await restarted.findByPublicId(proposal.publicId);
    assert.ok(loaded);
    assert.equal(loaded?.status, "pending");
  });

  it("rejects cross-customer confirmation claims", async () => {
    const { store } = useMemoryStore();
    const proposal = sampleProposal({ customerUserId: "user-a" });
    await store.insert(proposal);
    const claim = await store.claimPending(
      proposal.publicId,
      "user-b",
      new Date(),
    );
    assert.equal(claim.ok, false);
  });

  it("marks expired pending proposals", async () => {
    const { store } = useMemoryStore();
    const proposal = sampleProposal({
      expiresAt: new Date(Date.now() - 1_000),
    });
    await store.insert(proposal);
    const expired = await store.expirePending(
      proposal.publicId,
      "user-a",
      new Date(),
    );
    assert.equal(expired?.status, "expired");
  });

  it("allows only one concurrent claim across instances", async () => {
    const { shared, store } = useMemoryStore();
    const second = createMemoryCommerceStore(shared);
    const proposal = sampleProposal();
    await store.insert(proposal);
    const win = await store.claimPending(
      proposal.publicId,
      "user-a",
      new Date(),
    );
    const lose = await second.claimPending(
      proposal.publicId,
      "user-a",
      new Date(),
    );
    assert.equal(win.ok, true);
    assert.equal(lose.ok, false);
  });

  it("replays duplicate confirmation without re-execution", async () => {
    setCommerceAuditForTests(async () => undefined);
    const { store } = useMemoryStore();
    const proposal = sampleProposal({ status: "executed", verified: true });
    await store.insert(proposal);
    const replay = await beginCommerceConfirm({
      customerUserId: "user-a",
      publicId: proposal.publicId,
      expectedKind: "nameserver_update",
    });
    assert.equal(replay.ok, true);
    if (replay.ok) assert.equal(replay.mode, "replay");
  });

  it("records audit entries without sensitive fields", async () => {
    const audits: CommerceAuditEntry[] = [];
    setCommerceAuditForTests(async (entry) => {
      audits.push(entry);
    });
    const { store } = useMemoryStore();
    const proposal = sampleProposal();
    await store.insert(proposal);
    await beginCommerceConfirm({
      customerUserId: "user-a",
      publicId: proposal.publicId,
      expectedKind: "nameserver_update",
    });
    assert.ok(audits.some((row) => row.event === "CUSTOMER_CONFIRM_ATTEMPT"));
    const blob = JSON.stringify(audits);
    assert.equal(blob.includes("password"), false);
    assert.equal(blob.includes("sk_live"), false);
  });
});

describe("hosting order customer visibility", () => {
  it("uses stable order references and ACTIVE only when backend says ACTIVE", () => {
    const order = {
      id: "clhostingorder123456789",
      userId: "user-a",
      status: "PROVISIONING",
      productSlug: "web-hosting",
      planKey: "starter",
      billingCycle: "annually",
      configuration: {},
      lineItemsSnapshot: null,
      currency: "USD",
      subtotal: 10,
      discount: 0,
      tax: 0,
      total: 10,
      paymentProvider: "stripe",
      paymentReference: "cs_test_123",
      paymentStatus: "succeeded",
      paidAt: new Date(),
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as HostingOrder;
    const summary = toCustomerHostingOrderSummary(order);
    assert.match(summary.orderReference, /^HST-[A-F0-9]{10}$/);
    assert.equal(summary.isLive, false);
    assert.match(summary.statusMessage, /not active/i);
    const active = toCustomerHostingOrderSummary({
      ...order,
      status: "ACTIVE",
    });
    assert.equal(active.isLive, true);
    assert.equal(
      hostingOrderCustomerReference(order.id),
      summary.orderReference,
    );
  });

  it("describes paid-but-not-active hosting without claiming activation", () => {
    const paidPending = toCustomerHostingOrderSummary({
      id: "clorderpaidpending1",
      userId: "user-a",
      status: "PAID",
      productSlug: "web-hosting",
      planKey: "starter",
      billingCycle: "monthly",
      configuration: {},
      lineItemsSnapshot: null,
      currency: "USD",
      subtotal: 10,
      discount: 0,
      tax: 0,
      total: 10,
      paymentProvider: "stripe",
      paymentReference: "pi_test",
      paymentStatus: "succeeded",
      paidAt: new Date(),
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as HostingOrder);
    assert.equal(paidPending.isLive, false);
    assert.match(paidPending.statusMessage, /not live/i);
  });
});

describe("nameserver confirmation safety", () => {
  afterEach(() => {
    setBeyondMasterCommerceStoreForTests(null);
    setCommerceAuditForTests(null);
  });

  it("returns not found for cross-customer proposal confirm", async () => {
    setCommerceAuditForTests(async () => undefined);
    const { store } = useMemoryStore();
    const proposal = sampleProposal({ customerUserId: "user-a" });
    await store.insert(proposal);
    const result = await confirmNameserverProposal({
      customerUserId: "user-b",
      publicId: proposal.publicId,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 404);
  });
});

describe("registration and hosting payment safety", () => {
  afterEach(() => {
    setBeyondMasterCommerceStoreForTests(null);
    setCommerceAuditForTests(null);
  });

  it("does not mark hosting checkout proposals as verified after confirm", async () => {
    setCommerceAuditForTests(async () => undefined);
    const { store } = useMemoryStore();
    const proposal = sampleProposal({
      kind: "hosting_checkout",
      status: "executed",
      verified: false,
      resultMessage:
        "Stripe checkout opened. Payment and hosting activation follow Stripe and provisioning status — not this confirmation alone.",
      idempotencyKey: commerceIdempotencyKey(
        "user-a",
        "hosting_checkout",
        "order-1",
      ),
      payload: {
        orderId: "order-1",
        orderReference: "HST-ABCDEF0123",
        productSlug: "web-hosting",
        planKey: "starter",
        billingCycle: "monthly",
        currency: "USD",
        subtotal: 10,
        tax: 0,
        total: 10,
        renewNote: "test",
        checkoutPath: "/checkout",
      },
    });
    await store.insert(proposal);
    const replay = await beginCommerceConfirm({
      customerUserId: "user-a",
      publicId: proposal.publicId,
      expectedKind: "hosting_checkout",
    });
    assert.equal(replay.ok, true);
    if (replay.ok) {
      assert.equal(replay.mode, "replay");
      assert.equal(replay.view.verified, false);
    }
  });

  it("exposes confirm helpers for registrar and stripe paths", () => {
    assert.equal(typeof confirmDomainRegistrationProposal, "function");
    assert.equal(typeof confirmHostingCheckoutProposal, "function");
  });
});
