import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildCheckoutNote } from "@/lib/payments/checkout-currency";

const copy = {
  chargedInCheckout: "Charged in {currency} at checkout.",
  chargedInLocalCheckout:
    "Prices in {local}. Charged in {checkout} at checkout.",
};

describe("checkout currency note", () => {
  it("leads with the selected currency when settlement differs", () => {
    const note = buildCheckoutNote(copy, "NPR", "USD");
    assert.equal(note, "Prices in NPR. Charged in USD at checkout.");
  });

  it("states only the charge when the currencies match", () => {
    assert.equal(
      buildCheckoutNote(copy, "USD", "USD"),
      "Charged in USD at checkout.",
    );
  });

  it("never claims USD when NPR settlement is configured", () => {
    const note = buildCheckoutNote(copy, "NPR", "NPR");
    assert.equal(note, "Charged in NPR at checkout.");
    assert.doesNotMatch(note, /USD/);
  });

  it("is case insensitive and falls back safely", () => {
    assert.equal(
      buildCheckoutNote(copy, "npr", "usd"),
      "Prices in NPR. Charged in USD at checkout.",
    );
    assert.equal(
      buildCheckoutNote(copy, "", "USD"),
      "Charged in USD at checkout.",
    );
  });

  it("keeps the Hindi copy free of a hardcoded currency code", () => {
    const hindi = {
      chargedInCheckout: "चेकआउटमा {currency} मा शुल्क लाग्छ।",
      chargedInLocalCheckout:
        "मूल्य {local} मा देखाइएको छ। चेकआउटमा {checkout} मा शुल्क लाग्छ।",
    };
    const note = buildCheckoutNote(hindi, "NPR", "USD");
    assert.match(note, /NPR/);
    assert.match(note, /USD/);
  });
});
