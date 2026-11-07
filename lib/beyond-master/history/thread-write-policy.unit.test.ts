import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  humanSupportEnqueueBlockedReason,
  threadWriteBlockedReason,
} from "@/lib/beyond-master/history/thread-write-policy";

describe("thread write policy", () => {
  it("blocks overwriting another customer's thread", () => {
    assert.equal(
      threadWriteBlockedReason(
        { customerUserId: "cust_a", guestKey: null },
        "cust_b",
        true,
      ),
      "forbidden",
    );
    assert.equal(
      threadWriteBlockedReason(
        { customerUserId: "cust_a", guestKey: null },
        "cust_a",
        true,
      ),
      null,
    );
  });

  it("blocks guest writes to another customer's thread", () => {
    assert.equal(
      threadWriteBlockedReason(
        { customerUserId: "cust_a", guestKey: null },
        null,
        true,
      ),
      "forbidden",
    );
  });

  it("blocks signed-in users from writing guest-owned threads", () => {
    assert.equal(
      threadWriteBlockedReason(
        { customerUserId: null, guestKey: "abc" },
        "cust_a",
        true,
      ),
      "forbidden",
    );
    assert.equal(
      threadWriteBlockedReason(
        { customerUserId: null, guestKey: "abc" },
        null,
        true,
      ),
      null,
    );
  });

  it("blocks guest thread writes without capability match", () => {
    assert.equal(
      threadWriteBlockedReason(
        { customerUserId: null, guestKey: "aa" },
        null,
        false,
      ),
      "forbidden",
    );
  });
});

describe("human support enqueue policy", () => {
  it("blocks cross-customer enqueue", () => {
    assert.equal(
      humanSupportEnqueueBlockedReason(
        { customerUserId: "a", guestKey: null },
        "b",
        true,
      ),
      "forbidden",
    );
  });

  it("blocks guests from enqueueing on customer threads", () => {
    assert.equal(
      humanSupportEnqueueBlockedReason(
        { customerUserId: "a", guestKey: null },
        null,
        true,
      ),
      "forbidden",
    );
  });

  it("blocks signed-in users from guest-owned threads", () => {
    assert.equal(
      humanSupportEnqueueBlockedReason(
        { customerUserId: null, guestKey: "x" },
        "cust_a",
        true,
      ),
      "forbidden",
    );
  });

  it("allows guest on guest-owned threads with capability match", () => {
    assert.equal(
      humanSupportEnqueueBlockedReason(
        { customerUserId: null, guestKey: "x" },
        null,
        true,
      ),
      null,
    );
  });

  it("blocks guest enqueue when capability does not match stored guest key", () => {
    assert.equal(
      humanSupportEnqueueBlockedReason(
        { customerUserId: null, guestKey: "stored" },
        null,
        false,
      ),
      "forbidden",
    );
  });
});
