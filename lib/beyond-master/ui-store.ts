"use client";

import { useSyncExternalStore } from "react";

import {
  BEYOND_MASTER_PROVIDER_NOTICE,
  BEYOND_MASTER_STORAGE_KEY,
} from "@/lib/beyond-master/copy";
import { createSseParser } from "@/lib/beyond-master/providers/sse";
import {
  appendProviderNotice,
  appendUserMessage,
  chatContext,
  createConversation,
  dropFromMessage,
  dropMessage,
  markMessage,
  parseStoredConversations,
  updateMessage,
  upsertConversation,
  validateDraft,
} from "@/lib/beyond-master/thread";
import type {
  BeyondMasterConversation,
  BeyondMasterDomainSuggestion,
} from "@/lib/beyond-master/types";
import type { AccountCard } from "@/lib/beyond-master/account/types";
import type { DnsProposalView } from "@/lib/beyond-master/dns/workflow";

export type BeyondMasterView = "chat" | "history";

type SupportCard =
  | {
      kind: "review";
      confirmationId: string;
      category: string;
      priority: string;
      subject: string;
      domain: string | null;
      description: string;
      handoff: boolean;
    }
  | { kind: "details" | "signin" | "unavailable"; message: string }
  | {
      kind: "created";
      reference: string;
      notification: string;
      handoff: boolean;
    };

type DnsUiState =
  | "loading"
  | "proposal_ready"
  | "confirmation_required"
  | "executing"
  | "verified_success"
  | "verification_pending"
  | "failed"
  | "cancelled"
  | "expired";

type DnsCardState = {
  state: DnsUiState;
  proposal: DnsProposalView | null;
  message: string | null;
  records: { type: string; host: string; value: string; ttl: number }[] | null;
};

export type PendingAttachment = {
  id: string;
  name: string;
  sizeBytes: number;
};

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

type Snapshot = {
  open: boolean;
  view: BeyondMasterView;
  conversations: BeyondMasterConversation[];
  activeId: string;
  draft: string;
  checking: boolean;
  streaming: boolean;
  error: string | null;
  copiedId: string | null;
  supportCard: SupportCard | null;
  accountCards: AccountCard[] | null;
  dnsCard: DnsCardState | null;
  domainSuggestions: BeyondMasterDomainSuggestion[] | null;
  attachments: PendingAttachment[];
  uploading: boolean;
};

const serverSnapshot: Snapshot = {
  open: false,
  view: "chat",
  conversations: [],
  activeId: "",
  draft: "",
  checking: false,
  streaming: false,
  error: null,
  copiedId: null,
  supportCard: null,
  accountCards: null,
  dnsCard: null,
  domainSuggestions: null,
  attachments: [],
  uploading: false,
};

let snapshot: Snapshot = serverSnapshot;
const listeners = new Set<() => void>();
let hydrated = false;
let sendController: AbortController | null = null;
let copyTimer: ReturnType<typeof setTimeout> | null = null;

function emit(next: Snapshot) {
  snapshot = next;
  if (hydrated && typeof window !== "undefined") {
    try {
      sessionStorage.setItem(
        BEYOND_MASTER_STORAGE_KEY,
        JSON.stringify({
          conversations: next.conversations,
          activeId: next.activeId,
        }),
      );
    } catch {
      snapshot = {
        ...next,
        error:
          "This browser blocked conversation storage. Messages stay on screen only.",
      };
    }
  }
  for (const listener of listeners) listener();
}

function activeConversation(state: Snapshot): BeyondMasterConversation | null {
  return state.conversations.find((item) => item.id === state.activeId) ?? null;
}

function ensureActive(state: Snapshot): {
  state: Snapshot;
  conversation: BeyondMasterConversation;
} {
  const existing = activeConversation(state);
  if (existing) return { state, conversation: existing };
  const conversation = createConversation(new Date().toISOString(), newId());
  return {
    state: {
      ...state,
      activeId: conversation.id,
      conversations: upsertConversation(state.conversations, conversation),
    },
    conversation,
  };
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `bmai-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function hydrateBeyondMasterAi() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = sessionStorage.getItem(BEYOND_MASTER_STORAGE_KEY);
    if (!raw) return;
    const conversations = parseStoredConversations(raw);
    if (!conversations?.length) return;
    const parsed = JSON.parse(raw) as { activeId?: unknown };
    const activeId =
      typeof parsed.activeId === "string" &&
      conversations.some((item) => item.id === parsed.activeId)
        ? parsed.activeId
        : conversations[0]!.id;
    snapshot = { ...snapshot, conversations, activeId };
    for (const listener of listeners) listener();
  } catch {
    snapshot = {
      ...snapshot,
      error: "Saved conversation history could not be read.",
    };
    for (const listener of listeners) listener();
  }
}

export function subscribeBeyondMasterAi(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBeyondMasterAiSnapshot() {
  return snapshot;
}

export function getBeyondMasterAiServerSnapshot() {
  return serverSnapshot;
}

export function useBeyondMasterAi() {
  return useSyncExternalStore(
    subscribeBeyondMasterAi,
    getBeyondMasterAiSnapshot,
    getBeyondMasterAiServerSnapshot,
  );
}

export function openBeyondMasterAi() {
  emit({ ...snapshot, open: true, view: "chat", error: null });
}

export function closeBeyondMasterAi() {
  sendController?.abort();
  sendController = null;
  const conversation = activeConversation(snapshot);
  void persistActiveThread(snapshot);
  emit({
    ...snapshot,
    open: false,
    checking: false,
    streaming: false,
    attachments: [],
    activeId: "",
    conversations: conversation
      ? snapshot.conversations.filter((item) => item.id !== conversation.id)
      : snapshot.conversations,
  });
}

function persistActiveThread(state: Snapshot) {
  const conversation = activeConversation(state);
  if (!conversation || conversation.messages.length === 0) return;
  const payload = JSON.stringify({
    threadId: conversation.id,
    title: conversation.title,
    messages: conversation.messages.map((message) => ({
      role: message.role,
      body: message.body,
      createdAt: message.createdAt,
    })),
  });
  try {
    const body =
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
        ? new Blob([payload], { type: "application/json" })
        : null;
    if (body && navigator.sendBeacon("/api/beyond-master/threads", body)) {
      return;
    }
  } catch {
    /* fall through to fetch */
  }
  void fetch("/api/beyond-master/threads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export function removeBeyondMasterAttachment(id: string) {
  emit({
    ...snapshot,
    attachments: snapshot.attachments.filter((file) => file.id !== id),
  });
}

export async function uploadBeyondMasterAttachments(files: File[]) {
  if (files.length === 0) return;
  const tooLarge = files.find((file) => file.size > MAX_ATTACHMENT_BYTES);
  if (tooLarge) {
    emit({
      ...snapshot,
      error: `${tooLarge.name} is larger than 5 MB.`,
    });
    return;
  }
  const ensured = ensureActive(snapshot);
  emit({
    ...ensured.state,
    uploading: true,
    error: null,
    attachments: [
      ...snapshot.attachments,
      ...files.map((file) => ({
        id: `pending-${file.name}-${file.size}-${Date.now()}`,
        name: file.name,
        sizeBytes: file.size,
      })),
    ],
  });
  const form = new FormData();
  form.set("title", ensured.conversation.title);
  for (const file of files) form.append("files", file);
  try {
    const response = await fetch(
      `/api/beyond-master/threads/${encodeURIComponent(ensured.conversation.id)}/attachments`,
      { method: "POST", body: form },
    );
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      saved?: number;
    } | null;
    if (!response.ok) {
      emit({
        ...snapshot,
        uploading: false,
        attachments: [],
        error: payload?.error ?? "The file could not be uploaded.",
      });
      return;
    }
    emit({
      ...snapshot,
      uploading: false,
      attachments: [],
    });
  } catch {
    emit({
      ...snapshot,
      uploading: false,
      attachments: [],
      error: "The file could not be uploaded.",
    });
  }
}

export function toggleBeyondMasterHistory() {
  emit({
    ...snapshot,
    view: snapshot.view === "history" ? "chat" : "history",
  });
}

export function setBeyondMasterDraft(draft: string) {
  emit({ ...snapshot, draft, error: null });
}

export function startBeyondMasterConversation() {
  sendController?.abort();
  sendController = null;
  const conversation = createConversation(new Date().toISOString(), newId());
  emit({
    ...snapshot,
    view: "chat",
    checking: false,
    streaming: false,
    error: null,
    draft: "",
    activeId: conversation.id,
    domainSuggestions: null,
    conversations: upsertConversation(snapshot.conversations, conversation),
  });
}

export function selectBeyondMasterConversation(id: string) {
  if (!snapshot.conversations.some((item) => item.id === id)) return;
  emit({ ...snapshot, activeId: id, view: "chat", error: null, draft: "" });
}

export async function sendBeyondMasterMessage(text?: string) {
  const draft = text ?? snapshot.draft;
  const validated = validateDraft(draft);
  if (!validated.ok) {
    emit({ ...snapshot, error: validated.error });
    return;
  }
  sendController?.abort();
  const controller = new AbortController();
  sendController = controller;
  const ensured = ensureActive(snapshot);
  const createdAt = new Date().toISOString();
  const userMessage = {
    id: newId(),
    role: "user" as const,
    body: validated.body,
    createdAt,
    status: "pending" as const,
  };
  const withUser = appendUserMessage(ensured.conversation, userMessage);
  emit({
    ...ensured.state,
    view: "chat",
    draft: "",
    error: null,
    checking: true,
    accountCards: null,
    domainSuggestions: null,
    dnsCard: null,
    activeId: withUser.id,
    conversations: upsertConversation(ensured.state.conversations, withUser),
  });

  try {
    const response = await fetch("/api/beyond-master/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: chatContext(withUser.messages) }),
      signal: controller.signal,
    });
    if (sendController !== controller) return;
    if (response.status === 429) {
      throw new Error("Too many requests. Please try again shortly.");
    }
    if (!response.ok || !response.body) {
      let message = "The message could not be sent.";
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload.error) message = payload.error;
      } catch {
        message = "The message could not be sent.";
      }
      throw new Error(message);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const parser = createSseParser();
    let assistantId: string | null = null;
    let assistantBody = "";
    let failedMessage: string | null = null;
    const apply = (
      next: BeyondMasterConversation,
      extra?: Partial<Snapshot>,
    ) => {
      emit({
        ...snapshot,
        checking: true,
        conversations: upsertConversation(snapshot.conversations, next),
        ...extra,
      });
    };
    while (true) {
      const chunk = await reader.read();
      if (sendController !== controller) return;
      if (chunk.done) break;
      for (const frame of parser.push(
        decoder.decode(chunk.value, { stream: true }),
      )) {
        const data = JSON.parse(frame.data) as {
          code?: string;
          body?: string;
          text?: string;
          message?: string;
          kind?: string;
          confirmationId?: string;
          category?: string;
          priority?: string;
          subject?: string;
          domain?: string | null;
          description?: string;
          handoff?: boolean;
          cards?: AccountCard[];
          records?: {
            type: string;
            host: string;
            value: string;
            ttl: number;
          }[];
          proposal?: DnsProposalView;
          results?: BeyondMasterDomainSuggestion[];
        };
        if (
          frame.event === "dns" &&
          data.kind === "records" &&
          data.domain &&
          data.records
        ) {
          emit({
            ...snapshot,
            dnsCard: {
              state: "proposal_ready",
              proposal: null,
              message: null,
              records: data.records,
            },
          });
        } else if (frame.event === "dns" && data.kind === "notice") {
          const message = data.message ?? "DNS records could not be loaded.";
          const failed =
            /could not|rejected|unavailable|not found|too many/i.test(message);
          emit({
            ...snapshot,
            dnsCard: {
              state: failed ? "failed" : "proposal_ready",
              proposal: null,
              message,
              records: null,
            },
          });
        } else if (
          frame.event === "dns" &&
          data.kind === "proposal" &&
          data.proposal
        ) {
          emit({
            ...snapshot,
            dnsCard: {
              state: "confirmation_required",
              proposal: data.proposal,
              message: null,
              records: null,
            },
          });
        }
        if (frame.event === "account" && Array.isArray(data.cards)) {
          emit({ ...snapshot, accountCards: data.cards });
        }
        if (frame.event === "domains" && Array.isArray(data.results)) {
          emit({
            ...snapshot,
            domainSuggestions: data.results.filter(
              (row): row is BeyondMasterDomainSuggestion =>
                Boolean(
                  row &&
                  typeof row.domain === "string" &&
                  typeof row.href === "string",
                ),
            ),
          });
        }
        if (
          frame.event === "support" &&
          data.kind === "review" &&
          data.confirmationId
        ) {
          emit({
            ...snapshot,
            supportCard: {
              kind: "review",
              confirmationId: data.confirmationId,
              category: data.category ?? "other",
              priority: data.priority ?? "normal",
              subject: data.subject ?? "Support request",
              domain: data.domain ?? null,
              description: data.description ?? "",
              handoff: data.handoff === true,
            },
          });
        } else if (
          frame.event === "support" &&
          (data.kind === "details" ||
            data.kind === "signin" ||
            data.kind === "unavailable")
        ) {
          emit({
            ...snapshot,
            supportCard: {
              kind: data.kind,
              message: data.message ?? "A support ticket was not created.",
            },
          });
        }
        const current = activeConversation(snapshot) ?? withUser;
        if (
          frame.event === "notice" &&
          data.code === "provider_not_configured"
        ) {
          const sent = markMessage(
            current,
            userMessage.id,
            "sent",
            new Date().toISOString(),
          );
          apply(
            appendProviderNotice(sent, {
              id: newId(),
              role: "notice",
              body:
                data.body === BEYOND_MASTER_PROVIDER_NOTICE
                  ? BEYOND_MASTER_PROVIDER_NOTICE
                  : BEYOND_MASTER_PROVIDER_NOTICE,
              createdAt: new Date().toISOString(),
              status: "sent",
              code: "provider_not_configured",
            }),
            { checking: false, streaming: false },
          );
        } else if (frame.event === "delta" && typeof data.text === "string") {
          assistantBody += data.text;
          if (!assistantId) {
            assistantId = newId();
            const sent = markMessage(
              current,
              userMessage.id,
              "sent",
              new Date().toISOString(),
            );
            apply(
              {
                ...sent,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...sent.messages,
                  {
                    id: assistantId,
                    role: "assistant",
                    body: assistantBody,
                    createdAt: new Date().toISOString(),
                    status: "pending",
                  },
                ],
              },
              { streaming: true },
            );
          } else {
            apply(
              updateMessage(
                current,
                assistantId,
                { body: assistantBody, status: "pending" },
                new Date().toISOString(),
              ),
              { streaming: true },
            );
          }
        } else if (frame.event === "error") {
          failedMessage =
            data.message || "The AI provider could not complete this reply.";
        } else if (frame.event === "done" && !failedMessage) {
          const latest = activeConversation(snapshot) ?? current;
          if (assistantId) {
            apply(
              updateMessage(
                latest,
                assistantId,
                { status: "sent" },
                new Date().toISOString(),
              ),
              {
                checking: false,
                streaming: false,
                dnsCard:
                  snapshot.dnsCard?.state === "loading"
                    ? null
                    : snapshot.dnsCard,
              },
            );
          } else {
            emit({
              ...snapshot,
              checking: false,
              streaming: false,
              dnsCard:
                snapshot.dnsCard?.state === "loading" ? null : snapshot.dnsCard,
            });
          }
        }
      }
    }
    if (failedMessage) throw new Error(failedMessage);
    if (snapshot.checking)
      emit({ ...snapshot, checking: false, streaming: false });
    persistActiveThread(snapshot);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      const current = activeConversation(snapshot);
      if (!current) {
        emit({ ...snapshot, checking: false, streaming: false });
        return;
      }
      emit({
        ...snapshot,
        checking: false,
        streaming: false,
        conversations: upsertConversation(
          snapshot.conversations,
          dropMessage(current, userMessage.id),
        ),
      });
      return;
    }
    const current = activeConversation(snapshot);
    const message =
      error instanceof Error && error.message
        ? error.message.slice(0, 240)
        : "The message could not be sent.";
    if (!current) {
      emit({ ...snapshot, checking: false, streaming: false, error: message });
      return;
    }
    const failed = markMessage(
      current,
      userMessage.id,
      "failed",
      new Date().toISOString(),
    );
    emit({
      ...snapshot,
      checking: false,
      streaming: false,
      error: message,
      conversations: upsertConversation(snapshot.conversations, failed),
    });
  }
}

export async function retryBeyondMasterMessage(messageId: string) {
  const current = activeConversation(snapshot);
  const message = current?.messages.find((item) => item.id === messageId);
  if (!message || message.role !== "user" || message.status !== "failed")
    return;
  const without = dropFromMessage(current!, messageId);
  emit({
    ...snapshot,
    conversations: upsertConversation(snapshot.conversations, without),
    draft: message.body,
  });
  await sendBeyondMasterMessage(message.body);
}

let dnsConfirmInFlight = false;

export async function confirmBeyondMasterDns() {
  if (dnsConfirmInFlight) return;
  const card = snapshot.dnsCard;
  if (!card?.proposal || card.state !== "confirmation_required") return;
  dnsConfirmInFlight = true;
  emit({ ...snapshot, dnsCard: { ...card, state: "executing" } });
  try {
    const response = await fetch("/api/beyond-master/dns/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ proposalId: card.proposal.publicId }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      proposal?: DnsProposalView;
    } | null;
    if (!response.ok || !payload?.proposal) {
      emit({
        ...snapshot,
        dnsCard: {
          ...card,
          state: "failed",
          message: payload?.error ?? "The DNS change was not made.",
        },
      });
      return;
    }
    const proposal = payload.proposal;
    const state: DnsUiState =
      proposal.status === "cancelled"
        ? "cancelled"
        : proposal.status === "expired"
          ? "expired"
          : proposal.status === "failed" || proposal.verified === false
            ? "failed"
            : proposal.verified === true
              ? "verified_success"
              : "verification_pending";
    emit({
      ...snapshot,
      dnsCard: { state, proposal, message: null, records: null },
    });
  } finally {
    dnsConfirmInFlight = false;
  }
}

export async function cancelBeyondMasterDns() {
  const card = snapshot.dnsCard;
  if (!card?.proposal) return;
  const response = await fetch("/api/beyond-master/dns/cancel", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ proposalId: card.proposal.publicId }),
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  if (!response.ok) {
    emit({
      ...snapshot,
      dnsCard: {
        ...card,
        state: "failed",
        message: payload?.error ?? "The DNS proposal was not cancelled.",
      },
    });
    return;
  }
  emit({
    ...snapshot,
    dnsCard: {
      ...card,
      state: "cancelled",
      message: "The DNS proposal was cancelled. No change was made.",
    },
  });
}

export async function submitBeyondMasterTicket() {
  const card = snapshot.supportCard;
  if (!card || card.kind !== "review") return;
  emit({ ...snapshot, error: null });
  const response = await fetch("/api/beyond-master/tickets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ confirmationId: card.confirmationId }),
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    reference?: string;
    notification?: { customerDelivered?: boolean; supportDelivered?: boolean };
    handoff?: boolean;
  } | null;
  if (!response.ok || !payload?.reference) {
    emit({
      ...snapshot,
      error: payload?.error ?? "The ticket was not created.",
    });
    return;
  }
  const delivered =
    payload.notification?.customerDelivered === true ||
    payload.notification?.supportDelivered === true;
  emit({
    ...snapshot,
    error: null,
    supportCard: {
      kind: "created",
      reference: payload.reference,
      handoff: payload.handoff === true,
      notification: delivered
        ? "The mail provider confirmed delivery."
        : "The ticket is saved. Email delivery was not confirmed.",
    },
  });
}

export async function cancelBeyondMasterTicket() {
  const card = snapshot.supportCard;
  if (!card || card.kind !== "review") return;
  await fetch(
    `/api/beyond-master/tickets/drafts/${encodeURIComponent(card.confirmationId)}/cancel`,
    { method: "POST" },
  );
  emit({ ...snapshot, supportCard: null, error: null });
}

export function editBeyondMasterTicket() {
  const card = snapshot.supportCard;
  if (!card || card.kind !== "review") return;
  const confirmationId = card.confirmationId;
  emit({
    ...snapshot,
    supportCard: null,
    draft: card.description,
    error: null,
  });
  void fetch(
    `/api/beyond-master/tickets/drafts/${encodeURIComponent(confirmationId)}/cancel`,
    { method: "POST" },
  );
}

export async function copyBeyondMasterMessage(messageId: string, body: string) {
  try {
    await navigator.clipboard.writeText(body);
    emit({ ...snapshot, copiedId: messageId, error: null });
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      if (snapshot.copiedId === messageId)
        emit({ ...snapshot, copiedId: null });
    }, 1600);
  } catch {
    emit({ ...snapshot, error: "Copy was blocked by the browser." });
  }
}
