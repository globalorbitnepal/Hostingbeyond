import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { invalidateBeyondMasterKnowledgeCache } from "@/lib/beyond-master/knowledge/build";

/**
 * Regression for the published-article staleness bug found in the staging
 * integration suite: `buildBeyondMasterSystemPrompt` cached published articles
 * for 5 minutes, so an admin publish/unpublish was invisible to the agent.
 * Admin create/update must drop the cache.
 */
describe("beyond master knowledge cache invalidation", () => {
  it("exposes a cache reset used by admin publish/unpublish", () => {
    assert.equal(typeof invalidateBeyondMasterKnowledgeCache, "function");
    assert.doesNotThrow(() => invalidateBeyondMasterKnowledgeCache());
  });
});
