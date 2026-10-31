"use client";

import { useEffect, useState } from "react";

import { DocsHubPageEditor } from "@/components/orbit/docs-hub-page-editor";
import { DOCS_BASE } from "@/lib/docs/paths";
import {
  defaultDocsHubPageContent,
  type CmsDocsHubPageContent,
} from "@/lib/orbit/docs-hub-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitDocsHubPage() {
  const [content, setContent] = useState<CmsDocsHubPageContent>(
    defaultDocsHubPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/docs-hub");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsDocsHubPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/docs-hub", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as {
        content?: CmsDocsHubPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus(`Saved — live on ${DOCS_BASE}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Documentation hub</h1>
        <p className="mt-1 text-sm text-slate-500">
          Full page editor for{" "}
          <a href={DOCS_BASE} className="font-semibold text-[#673de6]">
            {DOCS_BASE}
          </a>
          — SEO, hero, site scope map, every doc article, standards, pillars,
          FAQ and CTA.
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <DocsHubPageEditor value={content} onChange={setContent} />
      <button
        type="button"
        disabled={saving}
        onClick={() => void save(content)}
        className="rounded-xl bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save documentation page"}
      </button>
    </div>
  );
}
