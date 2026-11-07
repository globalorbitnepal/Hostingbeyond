"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Globe,
  Mail,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  questionAnswersToPrompt,
  questionCustomPlaceholder,
  questionCustomSubmitLabel,
  questionProgressLabel,
  questionSkipLabel,
  questionSteps,
  type QuestionOption,
} from "@/lib/beyond-master/question-flow";

function OptionIcon({ icon }: { icon: QuestionOption["icon"] }) {
  if (icon === "domain") return <Globe className="size-4" aria-hidden />;
  if (icon === "email") return <Mail className="size-4" aria-hidden />;
  if (icon === "ai") return <Bot className="size-4" aria-hidden />;
  return <ShoppingBag className="size-4" aria-hidden />;
}

export function BeyondMasterQuestionCard({
  locale,
  disabled,
  onAnswer,
  onSkip,
}: {
  locale: string;
  disabled?: boolean;
  onAnswer: (prompt: string) => void;
  onSkip: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [custom, setCustom] = useState("");
  const customRef = useRef<HTMLInputElement>(null);

  const steps = useMemo(
    () => questionSteps(locale, answers),
    [locale, answers],
  );
  const current = steps[Math.min(step, steps.length - 1)] ?? steps[0];
  const total = useMemo(() => questionSteps(locale).length + 1, [locale]);

  useEffect(() => {
    setAnswers({});
    setStep(0);
    setCustom("");
  }, [locale]);

  if (!current) return null;

  function choose(option: QuestionOption) {
    const next = { ...answers, [current.id]: option.value };
    setAnswers(next);
    const nextSteps = questionSteps(locale, next);
    const goalChosen = current.id === "goal";
    if (goalChosen && nextSteps.length > 1) {
      setStep(1);
      return;
    }
    onAnswer(questionAnswersToPrompt(next));
  }

  function submitCustom() {
    const typed = custom.trim();
    if (!typed) {
      customRef.current?.focus();
      return;
    }
    onAnswer(questionAnswersToPrompt(answers, typed));
  }

  return (
    <section className="hb-bmai-qcard" aria-label={current.title}>
      <div className="hb-bmai-qcard-top">
        <span className="hb-bmai-qcard-progress">
          {questionProgressLabel(locale, step, total)}
        </span>
        <button
          type="button"
          className="hb-bmai-qcard-skip"
          onClick={onSkip}
          disabled={disabled}
        >
          {questionSkipLabel(locale)}
        </button>
      </div>
      <h3 className="hb-bmai-qcard-title">{current.title}</h3>
      <span className="hb-bmai-qcard-rule" aria-hidden />
      <ul className="hb-bmai-qcard-options">
        {current.options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              className="hb-bmai-qoption"
              onClick={() => choose(option)}
              disabled={disabled}
            >
              <span className="hb-bmai-qoption-icon">
                <OptionIcon icon={option.icon} />
              </span>
              <span className="hb-bmai-qoption-label">{option.label}</span>
              <span className="hb-bmai-qoption-radio" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <div className="hb-bmai-qcustom">
        <input
          ref={customRef}
          type="text"
          value={custom}
          placeholder={questionCustomPlaceholder(locale)}
          onChange={(event) => setCustom(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitCustom();
            }
          }}
          disabled={disabled}
        />
        <button
          type="button"
          className="hb-bmai-qcustom-send"
          aria-label={questionCustomSubmitLabel(locale)}
          onClick={submitCustom}
          disabled={disabled || custom.trim().length === 0}
        >
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
      <p className="hb-bmai-qcard-hint">
        <Sparkles className="size-3" aria-hidden />
        {step + 1 < steps.length
          ? `${steps.length - step - 1} more question`
          : "One tap and I start helping"}
      </p>
    </section>
  );
}
