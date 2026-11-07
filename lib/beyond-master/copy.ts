import type { BeyondMasterQuickAction } from "@/lib/beyond-master/types";

/** Product name used by Orbit status and the public panel. */
export const BEYOND_MASTER_NAME = "AI Agent";

export const BEYOND_MASTER_LAUNCHER_LABEL = "AI Agent";

export const BEYOND_MASTER_DOCK_PROMPTS = [
  "Can I help you?",
  "Need a domain?",
  "Compare hosting plans?",
  "Set up business email?",
  "Fix your website?",
] as const;

export const BEYOND_MASTER_DOCK_PROMPT = BEYOND_MASTER_DOCK_PROMPTS[0];

/** Same brand in Orbit. The public chat lives in the bottom-right dock. */
export const BEYOND_MASTER_BRAND_NAME = "AI Agent";

export const BEYOND_MASTER_PANEL_TITLE = "HostingBeyond Agent";

export const BEYOND_MASTER_TAGLINE =
  "Your HostingBeyond hosting and business assistant.";

export const BEYOND_MASTER_WELCOME_HEADING = "Hi! How can I help you today?";

export const BEYOND_MASTER_WELCOME_BODY = "";

export const BEYOND_MASTER_PRIMARY_TITLE = "Help me find what I need";

export const BEYOND_MASTER_PRIMARY_BODY =
  "Tell me what you’re trying to do and I’ll point you in the right direction.";

export const BEYOND_MASTER_INPUT_PLACEHOLDER = "Ask anything…";

export const BEYOND_MASTER_GREETING_REPLY =
  "Hi! I can help with a domain, hosting, business email, or your website. Tell me what you need in your own words — type, or hold the mic and speak.";

export const BEYOND_MASTER_DISCLAIMER =
  "AI can make mistakes. Double-check replies.";

export const BEYOND_MASTER_STORAGE_KEY = "hb-beyond-master-ai-v1";

/** Shown only in Orbit status when no language model credentials are configured. */
export const BEYOND_MASTER_PROVIDER_NOTICE =
  "AI Agent is not connected to a language model yet. This is a status notice, not an AI answer. Nothing was checked or changed on your domains, DNS, hosting, email, or billing. Set GEMINI_API_KEY on the server to enable live AI replies.";

export const BEYOND_MASTER_QUICK_ACTIONS: readonly BeyondMasterQuickAction[] = [
  {
    id: "find-domain",
    label: "Find and register a domain",
    prompt: "Help me find and register a domain.",
    icon: "domain",
  },
  {
    id: "hosting",
    label: "Compare hosting plans",
    prompt: "Show me your hosting plans and prices.",
    icon: "hosting",
  },
  {
    id: "email",
    label: "Set up business email",
    prompt: "Help me set up business email.",
    icon: "email",
  },
  {
    id: "website",
    label: "Fix my website",
    prompt: "Help me fix my website.",
    icon: "website",
  },
];

export const BEYOND_MASTER_MAX_MESSAGE_LENGTH = 4000;

export const BEYOND_MASTER_MAX_CONVERSATIONS = 20;
