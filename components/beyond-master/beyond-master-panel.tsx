"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock3, Plus, Send, X } from "lucide-react";

import {
  BEYOND_MASTER_DISCLAIMER,
  BEYOND_MASTER_INPUT_PLACEHOLDER,
  BEYOND_MASTER_LAUNCHER_LABEL,
  BEYOND_MASTER_PANEL_TITLE,
  BEYOND_MASTER_PRIMARY_BODY,
  BEYOND_MASTER_PRIMARY_TITLE,
  BEYOND_MASTER_QUICK_ACTIONS,
  BEYOND_MASTER_TAGLINE,
  BEYOND_MASTER_WELCOME_HEADING,
} from "@/lib/beyond-master/copy";
import {
  closeBeyondMasterAi,
  copyBeyondMasterMessage,
  hydrateBeyondMasterAi,
  retryBeyondMasterMessage,
  selectBeyondMasterConversation,
  sendBeyondMasterMessage,
  setBeyondMasterDraft,
  startBeyondMasterConversation,
  submitBeyondMasterTicket,
  cancelBeyondMasterTicket,
  editBeyondMasterTicket,
  confirmBeyondMasterDns,
  cancelBeyondMasterDns,
  toggleBeyondMasterHistory,
  useBeyondMasterAi,
} from "@/lib/beyond-master/ui-store";

import "@/styles/beyond-master.css";
import { BeyondMasterIcon } from "./beyond-master-icon";

function formatStamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BeyondMasterAiPanel() {
  const state = useBeyondMasterAi();
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const conversation = state.conversations.find(
    (item) => item.id === state.activeId,
  );
  const messages = conversation?.messages ?? [];
  const [ticketQuery, setTicketQuery] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [ticketRows, setTicketRows] = useState<
    { reference: string; status: string; subject: string; updatedAt: string }[]
  >([]);
  const [ticketNote, setTicketNote] = useState("");
  const [replyReference, setReplyReference] = useState("");
  const [replyBody, setReplyBody] = useState("");

  async function loadTickets() {
    const params = new URLSearchParams();
    if (ticketStatus) params.set("status", ticketStatus);
    if (ticketQuery.trim()) params.set("q", ticketQuery.trim());
    const response = await fetch(
      `/api/beyond-master/tickets?${params.toString()}`,
    );
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      tickets?: {
        reference: string;
        status: string;
        subject: string;
        updatedAt: string;
      }[];
    } | null;
    if (!response.ok) {
      setTicketNote(payload?.error ?? "Tickets could not be loaded.");
      setTicketRows([]);
      return;
    }
    setTicketNote("");
    setTicketRows(payload?.tickets ?? []);
  }

  async function sendTicketReply() {
    if (
      !/^BM-[0-9]+$/.test(replyReference.trim()) ||
      replyBody.trim().length < 2
    ) {
      setTicketNote("Choose one of your ticket references and write a reply.");
      return;
    }
    const response = await fetch(
      `/api/beyond-master/tickets/${encodeURIComponent(replyReference.trim())}/replies`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    if (!response.ok) {
      setTicketNote(payload?.error ?? "The reply was not saved.");
      return;
    }
    setReplyBody("");
    setTicketNote(`Reply saved on ${replyReference.trim()}.`);
    await loadTickets();
  }

  useEffect(() => {
    hydrateBeyondMasterAi();
  }, []);

  useEffect(() => {
    if (!state.open) return;
    restoreFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBeyondMasterAi();
    };
    document.addEventListener("keydown", onKeyDown);
    const narrow = window.matchMedia("(max-width: 639px)").matches;
    if (narrow) document.documentElement.classList.add("hb-scroll-lock");
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove("hb-scroll-lock");
      restoreFocus.current?.focus();
    };
  }, [state.open]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendBeyondMasterMessage();
  };

  const panel = (
    <>
      <button
        type="button"
        className="hb-bmai-backdrop"
        aria-label={`Close ${BEYOND_MASTER_LAUNCHER_LABEL}`}
        tabIndex={state.open ? 0 : -1}
        hidden={!state.open}
        onClick={closeBeyondMasterAi}
      />
      <section
        id="beyond-master-ai-panel"
        role="dialog"
        aria-modal={state.open}
        aria-labelledby={titleId}
        aria-hidden={!state.open}
        data-open={state.open ? "true" : "false"}
        className="hb-bmai-panel"
        inert={state.open ? undefined : true}
      >
        <header className="hb-bmai-header">
          <span className="hb-bmai-mark">
            <BeyondMasterIcon size={20} />
          </span>
          <div className="hb-bmai-title">
            <strong id={titleId} className="notranslate" translate="no">
              {BEYOND_MASTER_PANEL_TITLE}
            </strong>
            <span>{BEYOND_MASTER_TAGLINE}</span>
          </div>
          <button
            type="button"
            className="hb-bmai-icon-btn"
            aria-label="New conversation"
            onClick={startBeyondMasterConversation}
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            className="hb-bmai-icon-btn"
            aria-label="Conversation history"
            aria-pressed={state.view === "history"}
            onClick={toggleBeyondMasterHistory}
          >
            <Clock3 className="size-4" />
          </button>
          <button
            type="button"
            className="hb-bmai-icon-btn"
            aria-label={`Close ${BEYOND_MASTER_LAUNCHER_LABEL}`}
            onClick={closeBeyondMasterAi}
          >
            <X className="size-4" />
          </button>
        </header>

        {state.view === "history" ? (
          <div className="hb-bmai-history" aria-label="Conversation history">
            {state.conversations.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-500">
                No conversations in this browser tab yet.
              </p>
            ) : (
              state.conversations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={item.id === state.activeId}
                  onClick={() => selectBeyondMasterConversation(item.id)}
                >
                  <strong className="text-sm">{item.title}</strong>
                  <small>{formatStamp(item.updatedAt)}</small>
                </button>
              ))
            )}
          </div>
        ) : null}

        <div className="hb-bmai-scroll">
          {messages.length === 0 ? (
            <div className="hb-bmai-welcome">
              <div className="hb-bmai-hero-mark">
                <BeyondMasterIcon size={34} />
              </div>
              <h2>{BEYOND_MASTER_WELCOME_HEADING}</h2>
              <button
                type="button"
                className="hb-bmai-primary"
                onClick={() => {
                  setBeyondMasterDraft(BEYOND_MASTER_PRIMARY_TITLE);
                  inputRef.current?.focus();
                }}
              >
                <strong>{BEYOND_MASTER_PRIMARY_TITLE}</strong>
                <span>{BEYOND_MASTER_PRIMARY_BODY}</span>
              </button>
              <div className="hb-bmai-actions">
                {BEYOND_MASTER_QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="hb-bmai-action"
                    onClick={() => void sendBeyondMasterMessage(action.prompt)}
                    disabled={state.checking}
                  >
                    <strong>{action.label}</strong>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="hb-bmai-thread" aria-live="polite">
              {messages.map((message) =>
                message.role === "user" ? (
                  <article key={message.id} className="hb-bmai-user">
                    <p>{message.body}</p>
                    <div className="hb-bmai-meta">
                      <time dateTime={message.createdAt}>
                        {formatStamp(message.createdAt)}
                      </time>
                      {message.status === "failed" ? (
                        <button
                          type="button"
                          className="hb-bmai-text-btn"
                          onClick={() =>
                            void retryBeyondMasterMessage(message.id)
                          }
                        >
                          Retry
                        </button>
                      ) : (
                        <span>
                          {message.status === "pending" ? "Sending" : "Sent"}
                        </span>
                      )}
                    </div>
                  </article>
                ) : message.role === "assistant" ? (
                  <article key={message.id} className="hb-bmai-assistant">
                    <p>{message.body}</p>
                    <div className="hb-bmai-meta">
                      <time dateTime={message.createdAt}>
                        {formatStamp(message.createdAt)}
                      </time>
                      <button
                        type="button"
                        className="hb-bmai-text-btn"
                        onClick={() =>
                          void copyBeyondMasterMessage(message.id, message.body)
                        }
                      >
                        {state.copiedId === message.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </article>
                ) : (
                  <article key={message.id} className="hb-bmai-notice">
                    <p className="hb-bmai-kicker">Status, not an AI reply</p>
                    <p>{message.body}</p>
                    <div className="hb-bmai-meta">
                      <time dateTime={message.createdAt}>
                        {formatStamp(message.createdAt)}
                      </time>
                      <button
                        type="button"
                        className="hb-bmai-text-btn"
                        onClick={() =>
                          void copyBeyondMasterMessage(message.id, message.body)
                        }
                      >
                        {state.copiedId === message.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </article>
                ),
              )}
              {state.checking ? (
                <div className="hb-bmai-typing" role="status">
                  <span className="hb-bmai-dots" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                  {state.streaming
                    ? "Agent is writing…"
                    : "Agent is looking that up…"}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {state.dnsCard ? (
          <section className="hb-bmai-review" aria-label="DNS review">
            <h3>Review Changes</h3>
            {state.dnsCard.state === "loading" ||
            state.dnsCard.state === "executing" ? (
              <p>
                {state.dnsCard.state === "executing"
                  ? "Executing the confirmed DNS change…"
                  : "Loading DNS records…"}
              </p>
            ) : null}
            {state.dnsCard.message ? <p>{state.dnsCard.message}</p> : null}
            {state.dnsCard.records?.map((record) => (
              <p key={`${record.type}-${record.host}-${record.value}`}>
                {record.type} {record.host} {record.value} TTL {record.ttl}
              </p>
            ))}
            {state.dnsCard.proposal ? (
              <>
                <p>Domain: {state.dnsCard.proposal.domain}</p>
                <p>Action: {state.dnsCard.proposal.action}</p>
                <p>Type: {state.dnsCard.proposal.type}</p>
                <p>Host: {state.dnsCard.proposal.host}</p>
                {state.dnsCard.proposal.current ? (
                  <p>
                    Current record: {state.dnsCard.proposal.current.type}{" "}
                    {state.dnsCard.proposal.current.host}{" "}
                    {state.dnsCard.proposal.current.value} TTL{" "}
                    {state.dnsCard.proposal.current.ttl}
                    {state.dnsCard.proposal.current.distance
                      ? ` priority ${state.dnsCard.proposal.current.distance}`
                      : ""}
                  </p>
                ) : null}
                <p>Proposed value: {state.dnsCard.proposal.value}</p>
                <p>TTL: {state.dnsCard.proposal.ttl}</p>
                {state.dnsCard.proposal.priority != null ? (
                  <p>Priority: {state.dnsCard.proposal.priority}</p>
                ) : null}
                <p>{state.dnsCard.proposal.effect}</p>
                <p>{state.dnsCard.proposal.propagation}</p>
                {state.dnsCard.state === "verified_success" ? (
                  <p>
                    The registrar returned the requested record. Propagation may
                    still be in progress.
                  </p>
                ) : null}
                {state.dnsCard.state === "verification_pending" ? (
                  <p>
                    The registrar accepted the request. The result could not be
                    independently verified.
                  </p>
                ) : null}
                {state.dnsCard.state === "failed" ? (
                  <p>The DNS change is not reported as successful.</p>
                ) : null}
                {state.dnsCard.state === "expired" ? (
                  <p>This proposal expired.</p>
                ) : null}
                {state.dnsCard.state === "cancelled" ? (
                  <p>This proposal was cancelled. No DNS change was made.</p>
                ) : null}
              </>
            ) : null}
            {state.dnsCard.state === "confirmation_required" &&
            state.dnsCard.proposal ? (
              <div className="hb-bmai-review-actions">
                <button
                  type="button"
                  onClick={() => void confirmBeyondMasterDns()}
                >
                  Confirm DNS Changes
                </button>
                <button
                  type="button"
                  onClick={() => void cancelBeyondMasterDns()}
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {state.accountCards?.length ? (
          <section className="hb-bmai-review" aria-label="Account records">
            <h3>From your account records</h3>
            {state.accountCards.map((card, index) => (
              <article key={`${card.kind}-${index}`}>
                {card.kind === "domain" ? (
                  <>
                    <p>Domain: {card.name}</p>
                    <p>
                      Status: {card.status}
                      {card.active ? "" : " (not active)"}
                    </p>
                    <p>Registered: {card.registeredAt ?? "Not stored"}</p>
                    <p>Expires: {card.expiresAt ?? "Not stored"}</p>
                    <p>
                      Nameservers:{" "}
                      {card.nameserversUnavailable
                        ? "Not stored"
                        : card.nameservers.join(", ")}
                    </p>
                  </>
                ) : null}
                {card.kind === "hosting" ? (
                  <>
                    <p>Product: {card.product}</p>
                    <p>Plan: {card.plan}</p>
                    <p>
                      Status: {card.status}
                      {card.active ? "" : " (not active)"}
                    </p>
                    <p>Billing: {card.billingCycle}</p>
                    <p>Expires: {card.expiresAt ?? "Not stored"}</p>
                    <p>
                      Recorded total:{" "}
                      {card.recordedTotal
                        ? `${card.recordedTotal} ${card.currency}`
                        : "Not stored"}
                    </p>
                    <p>
                      SSL: {card.ssl ?? "No SSL note is stored on this plan"}
                    </p>
                    {card.specs.map((spec) => (
                      <p key={spec.label}>
                        {spec.label}: {spec.value}
                      </p>
                    ))}
                  </>
                ) : null}
                {card.kind === "invoice" ? (
                  <>
                    <p>Invoice: {card.number}</p>
                    <p>
                      Amount: {card.amount} {card.currency}
                    </p>
                    <p>Status: {card.status}</p>
                    <p>Due: {card.dueAt ?? "Not stored"}</p>
                    <p>
                      Paid: {card.paidAt ?? "Not paid in the stored record"}
                    </p>
                  </>
                ) : null}
                {card.kind === "wallet" ? (
                  <p>
                    {card.available
                      ? `Wallet balance: ${card.balance} ${card.currency}`
                      : "No wallet record is stored for this account."}
                  </p>
                ) : null}
                {card.kind === "transaction" || card.kind === "payment" ? (
                  <p>
                    {card.kind === "payment" ? card.reference : card.type}:{" "}
                    {card.amount} {card.currency} · {card.status}
                  </p>
                ) : null}
                {card.kind === "service" ? (
                  <p>
                    {card.serviceType}: {card.name} · {card.status}
                    {card.active ? "" : " (not active)"}
                  </p>
                ) : null}
                {card.kind === "notice" ? <p>{card.message}</p> : null}
              </article>
            ))}
          </section>
        ) : null}

        {state.domainSuggestions?.length ? (
          <div className="hb-bmai-domains" aria-label="Domain suggestions">
            {state.domainSuggestions.map((row) => (
              <a
                key={row.domain}
                className="hb-bmai-domain notranslate"
                href={row.href}
                translate="no"
              >
                <span>
                  <strong>{row.domain}</strong>
                  <span>
                    {row.status}
                    {row.register != null ? ` · $${row.register}/yr` : ""}
                  </span>
                </span>
              </a>
            ))}
          </div>
        ) : null}

        {state.error ? (
          <p className="hb-bmai-error" role="alert">
            {state.error}
          </p>
        ) : null}

        {state.supportCard?.kind === "review" ? (
          <section
            className="hb-bmai-review"
            aria-label="Review Your Support Request"
          >
            <h3>Review Your Support Request</h3>
            <p>Category: {state.supportCard.category}</p>
            <p>Priority: {state.supportCard.priority}</p>
            <p>Subject: {state.supportCard.subject}</p>
            <p>Domain: {state.supportCard.domain ?? "Not specified"}</p>
            <p>Description: {state.supportCard.description}</p>
            {state.supportCard.handoff ? (
              <p>
                A person can review this later. A live agent is not connected.
              </p>
            ) : null}
            <div className="hb-bmai-review-actions">
              <button
                type="button"
                onClick={() => void submitBeyondMasterTicket()}
              >
                Submit Ticket
              </button>
              <button type="button" onClick={editBeyondMasterTicket}>
                Edit Request
              </button>
              <button
                type="button"
                onClick={() => void cancelBeyondMasterTicket()}
              >
                Cancel
              </button>
            </div>
          </section>
        ) : null}
        {state.supportCard &&
        state.supportCard.kind !== "review" &&
        state.supportCard.kind !== "created" ? (
          <p className="hb-bmai-review-note">{state.supportCard.message}</p>
        ) : null}
        {state.supportCard?.kind === "created" ? (
          <p className="hb-bmai-review-note">
            Ticket {state.supportCard.reference} is saved.{" "}
            {state.supportCard.notification}
          </p>
        ) : null}

        {messages.length > 0 && (ticketRows.length > 0 || ticketNote) ? (
          <section className="hb-bmai-review" aria-label="Your support tickets">
            <h3>Your support tickets</h3>
            <div className="hb-bmai-review-actions">
              <input
                aria-label="Search tickets"
                value={ticketQuery}
                onChange={(event) => setTicketQuery(event.target.value)}
                placeholder="Search reference or subject"
              />
              <select
                aria-label="Filter by status"
                value={ticketStatus}
                onChange={(event) => setTicketStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="waiting_customer">Waiting for customer</option>
                <option value="waiting_support">Waiting for support</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <button type="button" onClick={() => void loadTickets()}>
                Search
              </button>
            </div>
            {ticketNote ? <p>{ticketNote}</p> : null}
            <ul>
              {ticketRows.map((ticket) => (
                <li key={ticket.reference}>
                  <button
                    type="button"
                    onClick={() => setReplyReference(ticket.reference)}
                  >
                    {ticket.reference} · {ticket.status} · {ticket.subject}
                  </button>
                </li>
              ))}
            </ul>
            <div className="hb-bmai-review-actions">
              <input
                aria-label="Ticket reference"
                value={replyReference}
                onChange={(event) => setReplyReference(event.target.value)}
                placeholder="BM-1000"
              />
              <input
                aria-label="Reply"
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                placeholder="Reply"
              />
              <button type="button" onClick={() => void sendTicketReply()}>
                Reply
              </button>
            </div>
          </section>
        ) : null}

        <form className="hb-bmai-composer" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="beyond-master-ai-input">
            Message {BEYOND_MASTER_LAUNCHER_LABEL}
          </label>
          <textarea
            id="beyond-master-ai-input"
            ref={inputRef}
            rows={1}
            value={state.draft}
            placeholder={BEYOND_MASTER_INPUT_PLACEHOLDER}
            disabled={state.checking}
            onChange={(event) => setBeyondMasterDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendBeyondMasterMessage();
              }
            }}
          />
          <button
            type="submit"
            className="hb-bmai-send"
            aria-label={state.checking ? "Sending" : "Send"}
            disabled={state.checking || state.draft.trim().length === 0}
          >
            <Send className="size-4" />
          </button>
        </form>
        <p className="hb-bmai-foot">{BEYOND_MASTER_DISCLAIMER}</p>
      </section>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
}
