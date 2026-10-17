import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { migrationRequestsWhereForCustomer } from "@/lib/migration/customer-migration-requests";

describe("migrationRequestsWhereForCustomer", () => {
  it("matches userId or legacy email rows", () => {
    const where = migrationRequestsWhereForCustomer(
      "user_abc",
      "Person@Example.com",
    );
    assert.deepEqual(where, {
      OR: [
        { userId: "user_abc" },
        { userId: null, customerEmail: "person@example.com" },
      ],
    });
  });
});
