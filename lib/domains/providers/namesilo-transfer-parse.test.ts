import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapNameSiloTransferReply } from "@/lib/domains/providers/namesilo-transfer-parse";

describe("NameSilo transfer reply", () => {
  it("maps order_id as the provider transfer id", () => {
    const row = mapNameSiloTransferReply("Example.COM", { order_id: "NS-88" });
    assert.equal(row.outcome, "success");
    assert.equal(row.domain, "example.com");
    assert.equal(row.status, "SUBMITTED");
    assert.equal(row.providerTransferId, "NS-88");
  });

  it("omits an empty order id", () => {
    const row = mapNameSiloTransferReply("a.com", { order_id: "  " });
    assert.equal(row.providerTransferId, undefined);
  });
});
