import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { accountTopics } from "@/lib/beyond-master/account/intent";

describe("account agent intent", () => {
  it("treats DNS and WordPress tasks as account work without the word my", () => {
    assert.deepEqual(accountTopics("Set DNS for the site"), ["domain"]);
    assert.deepEqual(accountTopics("Install WordPress on the hosting plan"), [
      "hosting",
    ]);
  });

  it("does not treat generic catalog questions as private account reads", () => {
    assert.deepEqual(accountTopics("What is WordPress hosting?"), []);
  });
});
