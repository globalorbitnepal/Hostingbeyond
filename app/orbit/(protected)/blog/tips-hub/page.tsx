"use client";

import { useEffect, useState } from "react";

import { TipsHubPageEditor } from "@/components/orbit/tips-hub-page-editor";
import { TIPS_BASE } from "@/lib/blog/paths";
import {
  defaultTipsHubPageContent,
  type CmsTipsHubPageContent,
} from "@/lib/orbit/tips-hub-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitTipsHubPage() {
  const [content, setContent] = useState<CmsTipsHubPageContent>(
    defaultTipsHubPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/tips-hub");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsTipsHubPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/tips-hub", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as { content?: CmsTipsHubPageContent };
      if (json.content) setContent(json.content);
      setStatus(`Saved — live on ${TIPS_BASE}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Tips hub page</h1>
        <p className="mt-1 text-sm text-slate-500">
          Public URL:{" "}
          <a href={TIPS_BASE} className="font-semibold text-[#673de6]">
            {TIPS_BASE}
          </a>
          . Individual guides are still created under{" "}
          <a href="/orbit/blog" className="text-[#673de6] underline">
            Blog → New tip / guide
          </a>
          .
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <TipsHubPageEditor value={content} onChange={setContent} />
      <button
        type="button"
        disabled={saving}
        onClick={() => void save(content)}
        className="rounded-xl bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save tips hub page"}
      </button>
    </div>
  );
}
