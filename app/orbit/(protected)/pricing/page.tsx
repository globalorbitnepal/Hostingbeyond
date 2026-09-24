"use client";

import { useEffect, useState } from "react";

import { PricingPageEditor } from "@/components/orbit/pricing-page-editor";
import { defaultPricingPageContent } from "@/lib/orbit/pricing-content";
import type { CmsPricingPageContent } from "@/lib/orbit/pricing-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitPricingPage() {
  const [content, setContent] = useState<CmsPricingPageContent | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/pricing");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
      else setContent(defaultPricingPageContent());
    })();
  }, []);

  async function persist(next: CmsPricingPageContent) {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/orbit/content/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        setStatus(parsed.text);
        setSaving(false);
        return;
      }
      const json = (await res.json()) as {
        content?: CmsPricingPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus("Saved — live on /pricing");
      setSaving(false);
    } catch (error) {
      setSaving(false);
      setStatus(error instanceof Error ? error.message : "Save failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Pricing page</h1>
      <p className="mt-1 text-sm text-slate-600">
        Edit the public{" "}
        <a href="/pricing" className="text-violet-600 underline">
          /pricing
        </a>{" "}
        hub — categories, videos, ecommerce tiers, and 10 FAQs per product line.
      </p>
      {status ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">{status}</p>
      ) : null}
      {content ? (
        <div className="mt-6">
          <PricingPageEditor
            value={content}
            onChange={setContent}
            onPersist={persist}
            saving={saving}
          />
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      )}
    </div>
  );
}
