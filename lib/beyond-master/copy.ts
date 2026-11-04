import type { BeyondMasterQuickAction } from "@/lib/beyond-master/types";

export const BEYOND_MASTER_NAME = "BEYOND MASTER AI";

export const BEYOND_MASTER_TAGLINE =
  "Your Intelligent Hosting & Business Assistant.";

export const BEYOND_MASTER_WELCOME_HEADING = "How can I help you today?";

export const BEYOND_MASTER_WELCOME_BODY =
  "I'm Beyond Master AI, your intelligent HostingBeyond assistant. I can help you manage domains, configure DNS, set up hosting, troubleshoot websites, manage business email and get technical support.";

export const BEYOND_MASTER_PRIMARY_TITLE = "Help me find what I need";

export const BEYOND_MASTER_PRIMARY_BODY =
  "Tell me what you're trying to accomplish and I'll guide you step by step.";

export const BEYOND_MASTER_INPUT_PLACEHOLDER =
  "Ask anything about HostingBeyond...";

export const BEYOND_MASTER_STORAGE_KEY = "hb-beyond-master-ai-v1";

/** Shown verbatim when no model provider is configured. This is not an AI answer. */
export const BEYOND_MASTER_PROVIDER_NOTICE =
  "Beyond Master AI is not connected to a language model yet. This message is a status notice, not an AI answer. Nothing was checked or changed on your domains, DNS, hosting, email, or billing.";

export const BEYOND_MASTER_QUICK_ACTIONS: readonly BeyondMasterQuickAction[] = [
  {
    id: "find-domain",
    label: "Find and Register a Domain",
    prompt: "Help me find and register a domain.",
  },
  {
    id: "dns",
    label: "Configure DNS Records",
    prompt: "Help me configure DNS records.",
  },
  {
    id: "hosting",
    label: "Set Up My Hosting",
    prompt: "Help me set up my hosting.",
  },
  {
    id: "website",
    label: "Fix My Website",
    prompt: "Help me fix my website.",
  },
  {
    id: "email",
    label: "Business Email Setup",
    prompt: "Help me set up business email.",
  },
  {
    id: "ssl",
    label: "SSL & Security",
    prompt: "Help me with SSL and security.",
  },
  {
    id: "billing",
    label: "Billing & Payments",
    prompt: "Help me with billing and payments.",
  },
  {
    id: "support",
    label: "Contact Technical Support",
    prompt: "I need technical support.",
  },
];

export const BEYOND_MASTER_MAX_MESSAGE_LENGTH = 4000;

export const BEYOND_MASTER_MAX_CONVERSATIONS = 20;
