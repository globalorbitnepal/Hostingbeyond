import type { BeyondMasterQuickAction } from "@/lib/beyond-master/types";

/** Product name used by Orbit status and the public panel. */
export const BEYOND_MASTER_NAME = "AI Agent";

export const BEYOND_MASTER_LAUNCHER_LABEL = "AI Agent";

/** Same brand on the header button, the panel header, and Orbit. */
export const BEYOND_MASTER_BRAND_NAME = "AI Agent";

export const BEYOND_MASTER_PANEL_TITLE = BEYOND_MASTER_BRAND_NAME;

export const BEYOND_MASTER_TAGLINE =
  "Your HostingBeyond hosting and business assistant.";

export const BEYOND_MASTER_WELCOME_HEADING = "Hi — how can I help?";

export const BEYOND_MASTER_WELCOME_BODY =
  "Ask about a domain, hosting, email, or your website. Type a message or tap the mic and speak in your language.";

export const BEYOND_MASTER_PRIMARY_TITLE = "Help me get started";

export const BEYOND_MASTER_PRIMARY_BODY =
  "Tell me what you need and I’ll find the right next step.";

export const BEYOND_MASTER_INPUT_PLACEHOLDER = "Ask anything, or tap the mic";

export const BEYOND_MASTER_GREETING_REPLY =
  "Hi! I can help with a domain, hosting, business email, or your website. Tell me what you need in your own words — type or tap the mic.";

export const BEYOND_MASTER_DISCLAIMER =
  "AI can make mistakes. Double-check replies.";

export const BEYOND_MASTER_STORAGE_KEY = "hb-beyond-master-ai-v1";

/** Shown only in Orbit status when no language model credentials are configured. */
export const BEYOND_MASTER_PROVIDER_NOTICE =
  "AI Agent is not connected to a language model yet. This is a status notice, not an AI answer. Nothing was checked or changed on your domains, DNS, hosting, email, or billing. Set GEMINI_API_KEY on the server to enable live AI replies.";

export const BEYOND_MASTER_QUICK_ACTIONS: readonly BeyondMasterQuickAction[] = [
  {
    id: "find-domain",
    label: "Find a domain",
    prompt: "Help me find and register a domain.",
  },
  {
    id: "hosting",
    label: "Compare hosting plans",
    prompt: "Show me your hosting plans and prices.",
  },
  {
    id: "email",
    label: "Set up business email",
    prompt: "Help me set up business email.",
  },
  {
    id: "website",
    label: "Fix my website",
    prompt: "Help me fix my website.",
  },
];

export const BEYOND_MASTER_MAX_MESSAGE_LENGTH = 4000;

export const BEYOND_MASTER_MAX_CONVERSATIONS = 20;
