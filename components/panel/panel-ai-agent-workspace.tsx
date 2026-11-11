"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, HardDrive, Mail, Mic, Sparkles, Wand2 } from "lucide-react";

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
      <section className="hb-panel-card overflow-hidden p-0 shadow-[0_24px_80px_-32px_rgba(76,29,149,0.55)]">
        <div className="relative isolate overflow-hidden bg-[radial-gradient(120%_80%_at_0%_0%,#7c3aed_0%,#5b21b6_42%,#1d4ed8_100%)] px-5 py-8 text-white sm:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-white/15 blur-3xl"
          />
          <p className="text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase">
            HostingBeyond Agent
          </p>
          <h2 className="mt-2 max-w-xl text-2xl font-bold tracking-tight sm:text-[1.7rem]">
            {name}, tell me the job
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
            Search in plain language. DNS, WordPress, and hosting stay on this
            account. Nothing is applied until you confirm.
          </p>
          <form className="relative mt-6" onSubmit={onSearch}>
            <Sparkles className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/75" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search — set DNS, install WordPress, manage hosting…"
              className="h-14 w-full rounded-full bg-white/14 pr-32 pl-12 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] ring-1 ring-white/30 outline-none placeholder:text-white/55 focus:bg-white/18 focus:ring-2 focus:ring-white/55"
            />
            <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
              <span
                className="grid size-10 place-items-center rounded-full text-white/70"
                title="Voice is in the assistant after you search"
              >
                <Mic className="h-4 w-4" />
              </span>
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-violet-800 shadow-sm"
              >
                {busy ? "…" : "Search"}
              </button>
            </div>
          </form>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-3">
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

      <section className="hb-panel-card flex flex-wrap items-start gap-4 p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--hb-p-primary)]/12 text-[var(--hb-p-primary)]">
          <Mail className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--hb-p-primary)] uppercase">
            Coming later
          </p>
          <h3 className="hb-h2 mt-1">Write mail with the agent</h3>
          <p className="hb-muted mt-1 max-w-2xl text-sm leading-relaxed">
            After you buy HostingBeyond Business Email, type bullets, a prompt,
            or speak — the agent will write the subject and a full message and
            drop it into your mailbox. Send from this page is not available yet.
          </p>
          <Link
            href={routes.accountEmail}
            className="hb-btn hb-btn-ghost hb-btn-sm mt-3"
          >
            View mailbox plans
          </Link>
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
