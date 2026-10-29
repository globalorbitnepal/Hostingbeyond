import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { prepareCloudTranslations } from "@/lib/integrations/translation/service";

const enabledEnv = {
  GOOGLE_TRANSLATE_ENABLED: "true",
  GOOGLE_CLOUD_PROJECT: "hostingbeyond-513017",
  GOOGLE_APPLICATION_CREDENTIALS: "/secure/translate-sa.json",
};

describe("prepareCloudTranslations", () => {
  it("skips prices and only sends remaining copy to the injected adapter", async () => {
    const sent: string[][] = [];
    const result = await prepareCloudTranslations(
      ["Choose a plan", "$4.99/mo", "example.com"],
      "es",
      enabledEnv,
      async (input) => {
        sent.push([...input.texts]);
        return input.texts.map((text) => `${text}-es`);
      },
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(sent, [["Choose a plan"]]);
    assert.deepEqual(result.items, [
      {
        original: "Choose a plan",
        translated: "Choose a plan-es",
        skipped: false,
      },
      { original: "$4.99/mo", translated: "$4.99/mo", skipped: true },
      { original: "example.com", translated: "example.com", skipped: true },
    ]);
  });
});
