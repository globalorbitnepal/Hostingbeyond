import { primaryLanguageSubtag } from "@/lib/beyond-master/locale";

export type QuestionOptionIcon = "website" | "domain" | "email" | "ai";

export type QuestionOption = {
  id: string;
  label: string;
  icon: QuestionOptionIcon;
  /** Answer recorded for this option. */
  value: string;
};

export type QuestionStep = {
  id: string;
  title: string;
  options: QuestionOption[];
};

type QuestionCopy = {
  progress: (index: number, total: number) => string;
  skip: string;
  customPlaceholder: string;
  customSubmit: string;
  steps: Record<string, { title: string; options: [string, string][] }>;
};

const EN: QuestionCopy = {
  progress: (i, total) => `Question ${i} of ${total}`,
  skip: "Skip",
  customPlaceholder: "Or, type your own answer…",
  customSubmit: "Send answer",
  steps: {
    goal: {
      title: "What are you looking for?",
      options: [
        ["website", "A website or online store"],
        ["domain", "A domain name"],
        ["email", "Business email"],
        ["ai", "An AI assistant or automation"],
      ],
    },
    domain_owned: {
      title: "Do you already have a domain name?",
      options: [
        ["has", "Yes, I have a name in mind"],
        ["suggest", "Suggest a name for my project"],
      ],
    },
    website_kind: {
      title: "What kind of website do you need?",
      options: [
        ["wordpress", "WordPress site"],
        ["store", "Online store"],
        ["app", "Custom app or API"],
      ],
    },
    email_kind: {
      title: "How should business email be set up?",
      options: [
        ["single", "One mailbox"],
        ["team", "Mailboxes for my team"],
        ["migrate", "Move email from another provider"],
      ],
    },
    ai_kind: {
      title: "What should the AI agent do?",
      options: [
        ["chat", "Answer customer questions"],
        ["automate", "Automate repetitive tasks"],
        ["unsure", "I am not sure yet"],
      ],
    },
  },
};

const HI: QuestionCopy = {
  progress: (i, total) => `Sawaal ${i} / ${total}`,
  skip: "Chhod dein",
  customPlaceholder: "Ya apna jawab likhein…",
  customSubmit: "Jawab bhejein",
  steps: {
    goal: {
      title: "Aapko kya chahiye?",
      options: [
        ["website", "Website ya online store"],
        ["domain", "Domain name"],
        ["email", "Business email"],
        ["ai", "AI assistant ya automation"],
      ],
    },
    domain_owned: {
      title: "Kya aapke paas domain name hai?",
      options: [
        ["has", "Haan, naam mere paas hai"],
        ["suggest", "Mere project ke liye naam suggest karein"],
      ],
    },
    website_kind: {
      title: "Kis tarah ki website chahiye?",
      options: [
        ["wordpress", "WordPress website"],
        ["store", "Online store"],
        ["app", "Custom app ya API"],
      ],
    },
    email_kind: {
      title: "Business email kaise set karein?",
      options: [
        ["single", "Ek mailbox"],
        ["team", "Meri team ke liye mailboxes"],
        ["migrate", "Doosre provider se email shift karein"],
      ],
    },
    ai_kind: {
      title: "AI agent kya kare?",
      options: [
        ["chat", "Customer ke sawaalon ke jawab de"],
        ["automate", "Repeat hone wale kaam automate kare"],
        ["unsure", "Abhi pakka nahi pata"],
      ],
    },
  },
};

const NE: QuestionCopy = {
  progress: (i, total) => `प्रश्न ${i} / ${total}`,
  skip: "छोड्नुहोस्",
  customPlaceholder: "वा आफ्नो जवाफ लेख्नुहोस्…",
  customSubmit: "जवाफ पठाउनुहोस्",
  steps: {
    goal: {
      title: "तपाईंलाई के चाहिन्छ?",
      options: [
        ["website", "वेबसाइट वा अनलाइन स्टोर"],
        ["domain", "डोमेन नाम"],
        ["email", "बिजनेस इमेल"],
        ["ai", "एआई सहायक वा अटोमेसन"],
      ],
    },
    domain_owned: {
      title: "तपाईंसँग डोमेन नाम छ?",
      options: [
        ["has", "हो, नाम मसँग छ"],
        ["suggest", "मेरो प्रोजेक्टका लागि नाम सुझाउनुहोस्"],
      ],
    },
    website_kind: {
      title: "कस्तो वेबसाइट चाहिन्छ?",
      options: [
        ["wordpress", "वर्डप्रेस वेबसाइट"],
        ["store", "अनलाइन स्टोर"],
        ["app", "कस्टम एप वा एपीआई"],
      ],
    },
    email_kind: {
      title: "बिजनेस इमेल कसरी मिलाउने?",
      options: [
        ["single", "एउटा मेलबक्स"],
        ["team", "टिमका लागि मेलबक्स"],
        ["migrate", "अर्को प्रोभाइडरबाट इमेल सार्ने"],
      ],
    },
    ai_kind: {
      title: "एआई एजेन्टले के गर्नुपर्छ?",
      options: [
        ["chat", "ग्राहकका प्रश्नको जवाफ दिने"],
        ["automate", "दोहोरिने काम अटोमेट गर्ने"],
        ["unsure", "अहिले निश्चित छैन"],
      ],
    },
  },
};

function copyFor(locale: string): QuestionCopy {
  const primary = primaryLanguageSubtag(locale);
  if (primary === "ne") return NE;
  if (primary === "hi") return HI;
  return EN;
}

const ORDER = ["goal", "domain_owned", "website_kind", "email_kind", "ai_kind"];

/** Steps to show, following the previous answer. */
export function questionSteps(
  locale: string,
  answers: Record<string, string> = {},
): QuestionStep[] {
  const copy = copyFor(locale);
  const ids = ["goal"];
  const goal = answers.goal;
  if (goal === "domain") ids.push("domain_owned");
  if (goal === "website") ids.push("website_kind");
  if (goal === "email") ids.push("email_kind");
  if (goal === "ai") ids.push("ai_kind");
  return ids.map((id) => {
    const step = copy.steps[id]!;
    return {
      id,
      title: step.title,
      options: step.options.map(([optionId, label]) => ({
        id: `${id}:${optionId}`,
        label,
        icon:
          id === "goal"
            ? (optionId as QuestionOptionIcon)
            : id === "domain_owned"
              ? "domain"
              : id === "email_kind"
                ? "email"
                : id === "ai_kind"
                  ? "ai"
                  : "website",
        value: optionId,
      })),
    };
  });
}

export function questionProgressLabel(
  locale: string,
  index: number,
  total: number,
): string {
  return copyFor(locale).progress(index + 1, Math.max(total, 1));
}

export function questionSkipLabel(locale: string): string {
  return copyFor(locale).skip;
}

export function questionCustomPlaceholder(locale: string): string {
  return copyFor(locale).customPlaceholder;
}

export function questionCustomSubmitLabel(locale: string): string {
  return copyFor(locale).customSubmit;
}

const GOAL_PROMPTS: Record<string, string> = {
  website: "I need a website or online store.",
  domain: "I need a domain name.",
  email: "I need business email.",
  ai: "I need an AI assistant or automation.",
};

const FOLLOW_UP_PROMPTS: Record<string, string> = {
  "domain:has": "I already have a domain name in mind.",
  "domain:suggest": "Suggest a domain name for a new project.",
  "website:wordpress": "I want a WordPress website.",
  "website:store": "I want an online store.",
  "website:app": "I need a custom app or API hosting.",
  "email:single": "I need one business mailbox.",
  "email:team": "I need mailboxes for my team.",
  "email:migrate": "I want to move email from another provider.",
  "ai:chat": "I want an AI agent that answers customer questions.",
  "ai:automate": "I want to automate repetitive tasks.",
  "ai:unsure": "I am not sure yet what the AI agent should do.",
};

export function questionAnswersToPrompt(
  answers: Record<string, string>,
  custom?: string,
): string {
  const extra = custom?.trim();
  if (extra) {
    const goal = answers.goal ? GOAL_PROMPTS[answers.goal] : "";
    return goal ? `${goal} ${extra}` : extra;
  }
  const goal = answers.goal ?? "";
  const followKey = ORDER.slice(1).find((id) => answers[id]);
  const followValue = followKey ? answers[followKey] : "";
  const follow =
    followKey && followValue
      ? FOLLOW_UP_PROMPTS[`${orderKeyToGoal(followKey)}:${followValue}`]
      : "";
  const base = GOAL_PROMPTS[goal] ?? "";
  return [base, follow].filter(Boolean).join(" ") || "I need help choosing.";
}

function orderKeyToGoal(stepId: string): string {
  if (stepId === "domain_owned") return "domain";
  if (stepId === "website_kind") return "website";
  if (stepId === "email_kind") return "email";
  if (stepId === "ai_kind") return "ai";
  return "goal";
}
