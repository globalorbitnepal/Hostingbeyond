import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AdminUser } from "@prisma/client";

import {
  assertCustomerOwnership,
  canExecuteReadOnlyTool,
  principalForPublicBeyondMasterChat,
  principalFromSession,
} from "@/lib/beyond-master/authorization";

const stubAdmin = {
  id: "adm",
  displayName: "Test",
  createdAt: new Date(),
  updatedAt: new Date(),
} as AdminUser;

describe("beyond master authorization", () => {
  it("denies private tools for guests", () => {
    const p = principalFromSession({
      customerUserId: null,
      orbitAdmin: null,
    });
    assert.equal(canExecuteReadOnlyTool(p, "get_my_domains"), false);
    assert.equal(canExecuteReadOnlyTool(p, "search_domain"), true);
  });

  it("allows private tools for customers", () => {
    const p = principalFromSession({
      customerUserId: "cust-1",
      orbitAdmin: null,
    });
    assert.equal(canExecuteReadOnlyTool(p, "get_my_invoices"), true);
  });

  it("maps support orbit to support principal and blocks private tools", () => {
    const p = principalFromSession({
      customerUserId: null,
      orbitAdmin: stubAdmin,
      orbitAccessMode: "support_only",
    });
    assert.equal(p.role, "support");
    assert.equal(canExecuteReadOnlyTool(p, "get_my_invoices"), false);
    assert.equal(canExecuteReadOnlyTool(p, "search_domain"), true);
  });

  it("maps full orbit to admin and still blocks staff-only paths via tool policy for private tools", () => {
    const p = principalFromSession({
      customerUserId: null,
      orbitAdmin: stubAdmin,
      orbitAccessMode: "full",
    });
    assert.equal(p.role, "admin");
    assert.equal(canExecuteReadOnlyTool(p, "get_my_domains"), false);
  });

  it("treats orbit admin with no access mode as guest (never customer or implicit admin)", () => {
    const p = principalFromSession({
      customerUserId: null,
      orbitAdmin: stubAdmin,
      orbitAccessMode: "none",
    });
    assert.equal(p.role, "guest");
  });

  describe("principalForPublicBeyondMasterChat", () => {
    it("uses verified customer id and ignores orbit staff for tool tier", () => {
      const p = principalForPublicBeyondMasterChat({
        customerUserId: "cust-1",
        orbitAdmin: stubAdmin,
        orbitAccessMode: "full",
      });
      assert.equal(p.role, "customer");
      if (p.role === "customer") assert.equal(p.customerUserId, "cust-1");
    });

    it("maps support-only orbit to support when no customer session", () => {
      const p = principalForPublicBeyondMasterChat({
        customerUserId: null,
        orbitAdmin: stubAdmin,
        orbitAccessMode: "support_only",
      });
      assert.equal(p.role, "support");
    });

    it("maps full orbit to admin when no customer session", () => {
      const p = principalForPublicBeyondMasterChat({
        customerUserId: null,
        orbitAdmin: stubAdmin,
        orbitAccessMode: "full",
      });
      assert.equal(p.role, "admin");
    });

    it("treats unknown orbit staff as guest when no customer session", () => {
      const p = principalForPublicBeyondMasterChat({
        customerUserId: null,
        orbitAdmin: stubAdmin,
        orbitAccessMode: "none",
      });
      assert.equal(p.role, "guest");
    });
  });

  it("rejects cross-customer ownership", () => {
    const p = principalFromSession({
      customerUserId: "alice",
      orbitAdmin: null,
    });
    const denied = assertCustomerOwnership(p, "bob");
    assert.equal(denied.ok, false);
    if (denied.ok === false) assert.equal(denied.code, "forbidden");
    const ok = assertCustomerOwnership(p, "alice");
    assert.equal(ok.ok, true);
  });
});
