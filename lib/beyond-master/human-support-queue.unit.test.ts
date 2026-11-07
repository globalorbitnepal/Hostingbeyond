import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SUPPORT_QUEUE_ASSIGNED,
  SUPPORT_QUEUE_OPEN,
} from "@/lib/beyond-master/human-support";
import { supportStaffCanAccessQueuedThread } from "@/lib/beyond-master/history/store";

describe("human support queue access (pure)", () => {
  const staff = "staff-1";

  it("allows support staff to see their assigned thread", () => {
    assert.equal(
      supportStaffCanAccessQueuedThread(
        {
          supportQueueStatus: SUPPORT_QUEUE_ASSIGNED,
          supportAssignedAdminId: staff,
        },
        staff,
      ),
      true,
    );
  });

  it("allows support staff to see unclaimed open queue rows", () => {
    assert.equal(
      supportStaffCanAccessQueuedThread(
        {
          supportQueueStatus: SUPPORT_QUEUE_OPEN,
          supportAssignedAdminId: null,
        },
        staff,
      ),
      true,
    );
  });

  it("denies support staff when another admin owns the assignment", () => {
    assert.equal(
      supportStaffCanAccessQueuedThread(
        {
          supportQueueStatus: SUPPORT_QUEUE_ASSIGNED,
          supportAssignedAdminId: "other-admin",
        },
        staff,
      ),
      false,
    );
  });

  it("denies when the thread is not in the human queue", () => {
    assert.equal(
      supportStaffCanAccessQueuedThread(
        { supportQueueStatus: null, supportAssignedAdminId: null },
        staff,
      ),
      false,
    );
  });
});
