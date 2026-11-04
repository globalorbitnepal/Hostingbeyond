import type { BeyondMasterQuickAction } from "@/lib/beyond-master/types";

/** Orbit console product name. The public header launcher uses Agent. */
export const BEYOND_MASTER_NAME = "BEYOND MASTER AI";

export const BEYOND_MASTER_LAUNCHER_LABEL = "Agent";

export const BEYOND_MASTER_PANEL_TITLE = "HostingBeyond Agent";

export const BEYOND_MASTER_TAGLINE = "Your hosting and business assistant";

export const BEYOND_MASTER_WELCOME_HEADING = "Hi! How can I help you today?";

export const BEYOND_MASTER_WELCOME_BODY = "";

export const BEYOND_MASTER_PRIMARY_TITLE = "Help me find what I need";

export const BEYOND_MASTER_PRIMARY_BODY =
  "Tell me what you are trying to do and I will point you in the right direction.";

export const BEYOND_MASTER_INPUT_PLACEHOLDER =
  "Ask anything about HostingBeyond...";

export const BEYOND_MASTER_DISCLAIMER =
  "AI can make mistakes. Double-check replies.";

export const BEYOND_MASTER_STORAGE_KEY = "hb-beyond-master-ai-v1";

/** Shown only in Orbit status. Public chat answers from catalog, search, and articles. */
export const BEYOND_MASTER_PROVIDER_NOTICE =
  "Beyond Master AI is not connected to a language model yet. This message is a status notice, not an AI answer. Nothing was checked or changed on your domains, DNS, hosting, email, or billing.";

export const BEYOND_MASTER_QUICK_ACTIONS: readonly BeyondMasterQuickAction[] = [
  {
    id: "find-domain",
    label: "Search and register a domain",
    prompt: "Help me find and register a domain.",
  },
  {
    id: "hosting",
    label: "Compare hosting plans",
    prompt: "Help me compare hosting plans and prices.",
  },
  {
    id: "website",
    label: "Build or fix my website",
    prompt: "Help me set up or fix my website.",
  },
  {
    id: "email",
    label: "Set up business email",
    prompt: "Help me set up business email.",
  },
];

export const BEYOND_MASTER_MAX_MESSAGE_LENGTH = 4000;

export const BEYOND_MASTER_MAX_CONVERSATIONS = 20;
