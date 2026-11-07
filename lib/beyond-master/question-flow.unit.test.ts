import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  questionAnswersToPrompt,
  questionSteps,
} from "@/lib/beyond-master/question-flow";

describe("beyond master guided questions", () => {
  it("starts with one goal question and four Hostinger-style options", () => {
    const steps = questionSteps("en");
    assert.equal(steps.length, 1);
    assert.equal(steps[0]!.id, "goal");
    assert.equal(steps[0]!.options.length, 4);
    assert.deepEqual(
      steps[0]!.options.map((row) => row.value),
      ["website", "domain", "email", "ai"],
    );
  });

  it("adds a follow-up step for the chosen goal", () => {
    const domain = questionSteps("en", { goal: "domain" });
    assert.equal(domain.length, 2);
    assert.equal(domain[1]!.id, "domain_owned");
    const email = questionSteps("en", { goal: "email" });
    assert.equal(email[1]!.id, "email_kind");
  });

  it("builds a natural chat prompt from the answers", () => {
    assert.equal(
      questionAnswersToPrompt({ goal: "domain" }),
      "I need a domain name.",
    );
    assert.equal(
      questionAnswersToPrompt({
        goal: "domain",
        domain_owned: "suggest",
      }),
      "I need a domain name. Suggest a domain name for a new project.",
    );
    assert.equal(
      questionAnswersToPrompt({ goal: "email" }, "for 12 people"),
      "I need business email. for 12 people",
    );
  });

  it("localizes titles for Hindi and Nepali", () => {
    assert.match(questionSteps("hi")[0]!.title, /kya|Aapko/i);
    assert.match(questionSteps("ne")[0]!.title, /तपाईं/);
  });

  it("wires the question card and tap-to-talk mic into the panel", () => {
    const panel = readFileSync(
      "components/beyond-master/beyond-master-panel.tsx",
      "utf8",
    );
    assert.equal(panel.includes("BeyondMasterQuestionCard"), true);
    assert.equal(panel.includes("hb-bmai-welcome-body"), true);
    const voice = readFileSync(
      "components/beyond-master/voice-bar.tsx",
      "utf8",
    );
    assert.equal(voice.includes("onClick={toggle}"), true);
    assert.equal(voice.includes("onPointerDown"), false);
  });
});
