"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu } from "lucide-react";

import { ModelSelector } from "@/components/beyond-ai/model-selector";
import { beyondAiOnDemandConfig } from "@/config/beyond-ai-product";
import { routes } from "@/config/routes";

type Sub = {
  planName: string;
  creditRemainingUsd: number;
  monthlyCreditUsd: number;
  onDemandEnabled: boolean;
};

export function BeyondAiWorkspace({ email }: { email: string }) {
  const [sub, setSub] = useState<Sub | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showOnDemand, setShowOnDemand] = useState(false);

  useEffect(() => {
    void fetch("/api/beyond-ai/subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.subscription) setSub(d.subscription);
      })
      .catch(() => undefined);
  }, []);

  const remaining = sub?.creditRemainingUsd ?? 0;
  const total = sub?.monthlyCreditUsd ?? 10;
  const used = Math.max(0, total - remaining);

  return (
    <div className="flex min-h-dvh bg-[#0f0a1f] text-white">
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#0c0618] p-4 lg:block">
        <p className="text-[11px] font-bold tracking-wide text-white/40 uppercase">
          Beyond AI
        </p>
        <nav className="mt-6 space-y-1 text-[13px] font-semibold">
          {[
            "Projects",
            "AI Workspace",
            "Models",
            "Usage",
            "Domains",
            "Hosting",
            "Billing",
            "Settings",
          ].map((item) => (
            <p
              key={item}
              className={
                item === "AI Workspace"
                  ? "rounded-lg bg-white/10 px-3 py-2 text-white"
                  : "px-3 py-2 text-white/55"
              }
            >
              {item}
            </p>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:px-8">
          <button type="button" className="lg:hidden" aria-label="Menu">
            <Menu className="size-5" />
          </button>
          <p className="text-[13px] text-white/60">{email}</p>
          <p className="rounded-full bg-[#673de6]/30 px-3 py-1 text-[12px] font-extrabold">
            AI credit ${remaining.toFixed(2)} left
          </p>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <h1 className="font-heading text-[1.75rem] font-extrabold">
            What are you building today?
          </h1>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your website or task…"
            className="mt-6 min-h-[120px] w-full max-w-3xl rounded-2xl border border-white/15 bg-white/5 p-4 text-[15px] text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-[#673de6]/50"
          />
          <div className="mt-6 max-w-3xl">
            <ModelSelector compact showEstimate />
          </div>

          {remaining <= 0 && !sub?.onDemandEnabled ? (
            <div className="mt-8 max-w-xl rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
              <p className="font-extrabold text-amber-100">
                You&apos;re out of included AI credit.
              </p>
              <p className="mt-2 text-[13px] text-amber-100/80">
                Enable on-demand usage to continue. Estimated next request: $
                {beyondAiOnDemandConfig.defaultEstimateUsd.toFixed(2)}
              </p>
              <button
                type="button"
                onClick={() => setShowOnDemand(true)}
                className="mt-4 h-10 rounded-full bg-white px-5 text-[13px] font-extrabold text-[#2f1c6a]"
              >
                Enable on-demand
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#673de6] to-[#7c3aed] px-6 text-[14px] font-extrabold"
              onClick={() => {
                if (remaining <= 0) setShowOnDemand(true);
                // TODO: POST /api/beyond-ai/generate with server-side credit deduction
              }}
            >
              Generate
              <ArrowRight className="size-4" />
            </button>
          )}

          {showOnDemand ? (
            <div className="mt-4 max-w-md rounded-xl border border-white/20 bg-white/5 p-4 text-[13px]">
              <p>
                Confirm on-demand usage (~$
                {beyondAiOnDemandConfig.defaultEstimateUsd.toFixed(2)})?
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-full bg-[#673de6] px-4 py-2 font-bold"
                  onClick={() => {
                    void fetch("/api/beyond-ai/on-demand", {
                      method: "POST",
                      body: JSON.stringify({ enable: true }),
                    }).then(() => setShowOnDemand(false));
                  }}
                >
                  Continue
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/30 px-4 py-2"
                  onClick={() => setShowOnDemand(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-12 max-w-md">
            <p className="text-[12px] font-bold text-white/50 uppercase">
              Usage
            </p>
            <p className="mt-2 text-[20px] font-extrabold">
              ${used.toFixed(2)} / ${total.toFixed(2)} used
            </p>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#7c3aed]"
                style={{ width: `${total ? (used / total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {!sub ? (
            <p className="mt-8 text-[14px] text-white/60">
              No active plan yet.{" "}
              <Link href={routes.beyondAi} className="font-bold text-[#c7d7ff]">
                Choose a plan
              </Link>
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}
