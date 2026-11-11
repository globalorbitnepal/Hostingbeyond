"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, HardDrive, Mail, Send, Sparkles, Wand2 } from "lucide-react";

import { routes } from "@/config/routes";
import {
  openBeyondMasterAi,
  sendBeyondMasterMessage,
  setBeyondMasterDraft,
} from "@/lib/beyond-master/ui-store";

export type AgentPlan = {
  orderId: string;
  planName: string;
  productName: string;
  readyForSites: boolean;
  remainingSlots: number | null;
};

export type AgentDomain = { domain: string };

const TASKS = [
  {
    id: "dns",
    label: "Set DNS",
    hint: "A, CNAME, MX — reviewed before apply",
    prompt:
      "Set DNS on my domain. Ask me for the record type, host, and value, then prepare a change for review.",
    icon: Globe,
    needs: "domain" as const,
  },
  {
    id: "wordpress",
    label: "Install WordPress",
    hint: "On an active hosting plan",
    prompt:
      "Install WordPress on my hosting. Use the active plan on this account and tell me what you need.",
    icon: Wand2,
    needs: "hosting" as const,
  },
  {
    id: "hosting",
    label: "Manage hosting",
    hint: "Plan status, sites, SSL",
    prompt:
      "Manage my hosting. Show the live plan, websites, and what I can change next.",
    icon: HardDrive,
    needs: "hosting" as const,
  },
  {
    id: "write-mail",
    label: "Write email",
    hint: "Draft in this workspace",
    prompt:
      "Help me write a professional email from my HostingBeyond mailbox. Ask for the recipient and what I want to say.",
    icon: Mail,
    needs: "none" as const,
  },
] as const;

export function PanelAiAgentWorkspace({
  name,
  plans,
  domains,
}: {
  name: string;
  plans: AgentPlan[];
  domains: AgentDomain[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const readyPlan = plans.find((plan) => plan.readyForSites) ?? null;
  const hasDomain = domains.length > 0;
  const defaultDomain = domains[0]?.domain ?? "";

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      setBeyondMasterDraft(trimmed);
      openBeyondMasterAi();
      await sendBeyondMasterMessage(trimmed);
    } finally {
      setBusy(false);
    }
  }

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    await ask(query);
    setQuery("");
  }

  return (
    <div className="space-y-5">
      <section className="hb-panel-card overflow-hidden p-0">
        <div className="bg-gradient-to-br from-[#5b21b6] via-[#6d28d9] to-[#2563eb] px-5 py-6 text-white sm:px-7">
          <p className="text-[11px] font-bold tracking-[0.16em] text-white/70 uppercase">
            Beyond Master
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">
            {name}, search and I’ll do the work
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-white/80">
            DNS, WordPress, hosting, and mail — scoped to the plan you already
            own. Nothing is applied until you confirm.
          </p>
          <form className="relative mt-5" onSubmit={onSearch}>
            <Sparkles className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. set A record for shop.example.com to 1.2.3.4"
              className="w-full rounded-2xl bg-white/15 py-3 pr-24 pl-10 text-sm text-white ring-1 ring-white/25 outline-none placeholder:text-white/55"
            />
            <button
              type="submit"
              disabled={busy}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-violet-800"
            >
              {busy ? "…" : "Ask"}
            </button>
          </form>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-2">
          {TASKS.map((task) => {
            const Icon = task.icon;
            const locked =
              (task.needs === "domain" && !hasDomain) ||
              (task.needs === "hosting" && !readyPlan);
            return (
              <button
                key={task.id}
                type="button"
                disabled={locked || busy}
                onClick={() => void ask(task.prompt)}
                className="hb-soft flex items-start gap-3 px-3 py-3 text-left disabled:opacity-50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--hb-p-primary)]/12 text-[var(--hb-p-primary)]">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="hb-text block text-sm font-bold">
                    {task.label}
                  </span>
                  <span className="hb-muted block text-xs">
                    {locked
                      ? task.needs === "hosting"
                        ? "Needs an active hosting plan"
                        : "Register a domain first"
                      : task.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {readyPlan ? (
        <WordpressQuickInstall
          orderId={readyPlan.orderId}
          planName={readyPlan.planName}
          defaultDomain={defaultDomain}
          remainingSlots={readyPlan.remainingSlots}
          onDone={() => router.refresh()}
        />
      ) : (
        <p className="hb-muted text-sm">
          WordPress install unlocks after a hosting plan is Active.{" "}
          <Link href={routes.accountHosting} className="hb-text font-semibold">
            Choose a plan
          </Link>
        </p>
      )}

      <MailComposer />
    </div>
  );
}

function WordpressQuickInstall({
  orderId,
  planName,
  defaultDomain,
  remainingSlots,
  onDone,
}: {
  orderId: string;
  planName: string;
  defaultDomain: string;
  remainingSlots: number | null;
  onDone: () => void;
}) {
  const [name, setName] = useState("WordPress");
  const [domain, setDomain] = useState(defaultDomain);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const blocked = remainingSlots != null && remainingSlots <= 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/account/hosting/sites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orderId,
          type: "wordpress",
          name,
          domain: domain.trim(),
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(json?.error ?? "Could not queue WordPress.");
        return;
      }
      setOk("WordPress install queued on this plan.");
      onDone();
    } catch {
      setError("Could not queue WordPress.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="hb-panel-card p-5">
      <h3 className="hb-h2">Install WordPress</h3>
      <p className="hb-muted mt-1 text-xs">
        Queued on {planName}. Staff finish the control-panel install if the
        server API is not live yet.
      </p>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
        <label className="text-xs font-semibold">
          Site name
          <input
            className="hb-input mt-1 w-full"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="text-xs font-semibold">
          Domain
          <input
            className="hb-input mt-1 w-full"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="example.com"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="hb-btn hb-btn-primary"
            disabled={busy || blocked}
          >
            {busy ? "Queueing…" : "Install WordPress"}
          </button>
          {blocked ? (
            <p className="hb-muted mt-2 text-xs">
              This plan is at its site limit.
            </p>
          ) : null}
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          {ok ? <p className="mt-2 text-sm text-emerald-700">{ok}</p> : null}
        </div>
      </form>
    </section>
  );
}

function MailComposer() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/account/mail/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
        id?: string;
      } | null;
      if (!res.ok) {
        setError(json?.error ?? "Could not queue the email.");
        return;
      }
      setOk(json?.message ?? "Queued.");
      setBody("");
    } catch {
      setError("Could not queue the email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="hb-panel-card p-5">
      <h3 className="hb-h2">Write & send mail</h3>
      <p className="hb-muted mt-1 text-xs">
        Draft here. Send is queued to your mailbox — it does not pretend to
        leave until a mailbox plan is active.
      </p>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <input
          className="hb-input w-full"
          type="email"
          required
          placeholder="To"
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
        <input
          className="hb-input w-full"
          required
          placeholder="Subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
        <textarea
          className="hb-input min-h-28 w-full"
          required
          placeholder="Message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <button type="submit" className="hb-btn hb-btn-primary" disabled={busy}>
          <Send className="mr-1 inline h-4 w-4" />
          {busy ? "Queueing…" : "Queue send"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {ok ? <p className="text-sm text-emerald-700">{ok}</p> : null}
      </form>
    </section>
  );
}
