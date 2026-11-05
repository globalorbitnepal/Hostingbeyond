import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { planReadOnlyTools } from "@/lib/beyond-master/tools/intent";
import {
  executeReadOnlyTool,
  setBeyondMasterToolReadersForTests,
} from "@/lib/beyond-master/tools/handlers";
import type { AccountReader } from "@/lib/beyond-master/account/read";

describe("read-only agent tools", () => {
  it("plans domain search and hosting plan intents", () => {
    const search = planReadOnlyTools("Check whether bakery.com is available");
    assert.ok(search.some((row) => row.tool === "search_domain"));
    const plans = planReadOnlyTools("Compare hosting plan prices");
    assert.ok(plans.some((row) => row.tool === "get_hosting_plans"));
  });

  it("requires sign-in for private account tools", async () => {
    const result = await executeReadOnlyTool(
      { customerUserId: null, ip: "test" },
      { tool: "get_my_domains", args: {} },
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "sign_in_required");
      assert.equal(result.signInRequired, true);
    }
  });

  it("scopes domain reads to the authenticated customer", async () => {
    const reader: AccountReader = {
      async domains(userId) {
        assert.equal(userId, "customer-a");
        return [
          {
            name: "owned.example",
            status: "ACTIVE",
            registeredAt: null,
            expiresAt: null,
            nameservers: [],
          },
        ];
      },
      async hosting() {
        return [];
      },
      async invoices() {
        return [];
      },
      async wallet() {
        return null;
      },
      async transactions() {
        return [];
      },
      async payments() {
        return [];
      },
    };
    setBeyondMasterToolReadersForTests({ account: reader });
    const result = await executeReadOnlyTool(
      { customerUserId: "customer-a", ip: "test" },
      { tool: "get_my_domains", args: {} },
    );
    assert.equal(result.ok, true);
    setBeyondMasterToolReadersForTests({ account: null });
  });

  it("validates DNS tool domain arguments", async () => {
    const result = await executeReadOnlyTool(
      { customerUserId: "customer-a", ip: "test" },
      { tool: "get_dns_records", args: { domain: "not valid" } },
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "invalid_args");
  });
});
