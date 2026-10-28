import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizePublicDisplayCurrency,
  PUBLIC_DISPLAY_CURRENCIES,
} from "@/lib/i18n/display-currencies";

describe("display-currencies", () => {
  it("allows USD INR NPR only", () => {
    assert.deepEqual([...PUBLIC_DISPLAY_CURRENCIES], ["USD", "INR", "NPR"]);
  });

  it("falls back unknown codes to USD", () => {
    assert.equal(normalizePublicDisplayCurrency("EUR"), "USD");
    assert.equal(normalizePublicDisplayCurrency("inr"), "INR");
  });
});
