"use client";

import { useEffect, useState } from "react";

import { BeyondAiProductPageEditor } from "@/components/orbit/beyond-ai-product-page-editor";
import { defaultBeyondAiPageContent } from "@/lib/orbit/beyond-ai-page-content";
import type { CmsBeyondAiPageContent } from "@/lib/orbit/beyond-ai-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitBeyondAiProductPage() {
  const [content, setContent] = useState<CmsBeyondAiPageContent | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/beyond-ai");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
      else setContent(defaultBeyondAiPageContent());
    })();
  }, []);

  async function persist(next: CmsBeyondAiPageContent) {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/orbit/content/beyond-ai", {
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
        content?: CmsBeyondAiPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus("Saved — live on /beyond-ai");
      setSaving(false);
    } catch (error) {
      setSaving(false);
      setStatus(error instanceof Error ? error.message : "Save failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Beyond AI product page
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Full edit for the public{" "}
        <a href="/beyond-ai" className="text-violet-600 underline">
          /beyond-ai
        </a>{" "}
        page — hero, pricing cards, video band, and FAQs. Checkout plan IDs stay
        tied to{" "}
        <code className="rounded bg-slate-100 px-1">beyond-ai-product</code>{" "}
        config for billing.
      </p>
      {status ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">{status}</p>
      ) : null}
      {content ? (
        <div className="mt-6">
          <BeyondAiProductPageEditor
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
