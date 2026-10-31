"use client";

import { useEffect, useState } from "react";

import { GrowthHubPageEditor } from "@/components/orbit/growth-hub-page-editor";
import { GROWTH_BASE } from "@/lib/growth/paths";
import {
  defaultGrowthHubPageContent,
  type CmsGrowthHubPageContent,
} from "@/lib/orbit/growth-hub-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitGrowthHubPage() {
  const [content, setContent] = useState<CmsGrowthHubPageContent>(
    defaultGrowthHubPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/growth-hub");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsGrowthHubPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/growth-hub", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as {
        content?: CmsGrowthHubPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus(`Saved — live on ${GROWTH_BASE}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Growth hub</h1>
        <p className="mt-1 text-sm text-slate-500">
          Full page editor for{" "}
          <a href={GROWTH_BASE} className="font-semibold text-[#673de6]">
            {GROWTH_BASE}
          </a>
          — SEO, hero, stages, playbooks, principles, pillars, FAQ and CTA. No
          image fields — premium layout only.
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <GrowthHubPageEditor value={content} onChange={setContent} />
      <button
        type="button"
        disabled={saving}
        onClick={() => void save(content)}
        className="rounded-xl bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save growth page"}
      </button>
    </div>
  );
}
