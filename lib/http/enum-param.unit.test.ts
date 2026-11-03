import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseEnumParam,
  parseOptionalBoundedInt,
  parseOptionalEnumParam,
} from "@/lib/http/enum-param";

const STATUSES = ["NEW", "REVIEWING", "COMPLETED"] as const;

describe("parseOptionalEnumParam", () => {
  it("treats absent values as no filter", () => {
    for (const raw of [undefined, null, "", "   "]) {
      assert.deepEqual(parseOptionalEnumParam(raw, STATUSES), {
        ok: true,
        value: undefined,
      });
    }
  });

  it("accepts known values", () => {
    assert.deepEqual(parseOptionalEnumParam("COMPLETED", STATUSES), {
      ok: true,
      value: "COMPLETED",
    });
  });

  it("rejects unknown values instead of querying the database", () => {
    for (const raw of ["COMPLETE", "completed", "1", "NEW;DROP"]) {
      assert.deepEqual(parseOptionalEnumParam(raw, STATUSES), {
        ok: false,
        reason: "unknown",
      });
    }
  });
});

describe("parseEnumParam", () => {
  it("requires a value", () => {
    assert.deepEqual(parseEnumParam("", STATUSES), {
      ok: false,
      reason: "missing",
    });
  });

  it("returns the typed value when allowed", () => {
    assert.deepEqual(parseEnumParam(" NEW ", STATUSES), {
      ok: true,
      value: "NEW",
    });
  });
});

describe("parseOptionalBoundedInt", () => {
  it("accepts numbers and digit strings in range", () => {
    assert.deepEqual(parseOptionalBoundedInt(3, 0, 10), { ok: true, value: 3 });
    assert.deepEqual(parseOptionalBoundedInt("7", 0, 10), {
      ok: true,
      value: 7,
    });
  });

  it("treats empty input as not provided", () => {
    for (const raw of [undefined, null, ""]) {
      assert.deepEqual(parseOptionalBoundedInt(raw, 0, 10), {
        ok: true,
        value: undefined,
      });
    }
  });

  it("rejects out-of-range, fractional, and non-numeric input", () => {
    for (const raw of [-1, 11, 1.5, "1.5", "abc", true, {}]) {
      assert.deepEqual(parseOptionalBoundedInt(raw, 0, 10), { ok: false });
    }
  });
});
