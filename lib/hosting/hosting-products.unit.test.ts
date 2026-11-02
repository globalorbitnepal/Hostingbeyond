import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertSafeProductSlug,
  HostingPlanValidationError,
} from "./hosting-products";

describe("assertSafeProductSlug", () => {
  it("accepts a normal slug", () => {
    assert.equal(assertSafeProductSlug("web-hosting"), "web-hosting");
  });

  it("normalises case and surrounding space", () => {
    assert.equal(assertSafeProductSlug("  KVM-VPS  "), "kvm-vps");
  });

  it("rejects spaces and slashes", () => {
    assert.throws(
      () => assertSafeProductSlug("web hosting"),
      HostingPlanValidationError,
    );
    assert.throws(
      () => assertSafeProductSlug("web/hosting"),
      HostingPlanValidationError,
    );
  });

  it("rejects reserved application paths", () => {
    for (const reserved of ["orbit", "api", "checkout", "account", "login"]) {
      assert.throws(
        () => assertSafeProductSlug(reserved),
        HostingPlanValidationError,
        `${reserved} must be reserved`,
      );
    }
  });

  it("rejects leading/trailing hyphens and empty strings", () => {
    assert.throws(
      () => assertSafeProductSlug("-web"),
      HostingPlanValidationError,
    );
    assert.throws(
      () => assertSafeProductSlug("web-"),
      HostingPlanValidationError,
    );
    assert.throws(() => assertSafeProductSlug(""), HostingPlanValidationError);
  });
});
