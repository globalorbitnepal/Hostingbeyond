"use client";

import { useEffect, useState } from "react";

import { HostingPageEditor } from "@/components/orbit/hosting-page-editor";
import {
  defaultHostingPageContent,
  type CmsHostingPageContent,
} from "@/lib/orbit/hosting-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitHostingPage() {
  const [content, setContent] = useState<CmsHostingPageContent>(
    defaultHostingPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/hosting");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsHostingPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/hosting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as { content?: CmsHostingPageContent };
      if (json.content) setContent(json.content);
      setStatus("Saved — live on /hosting");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Web Hosting page</h1>
        <p className="mt-1 text-sm text-slate-600">
          <a href="/hosting" className="text-violet-600 underline">
            /hosting
          </a>{" "}
          · SEO in{" "}
          <a href="/orbit/seo" className="underline">
            Orbit → SEO
          </a>{" "}
          (slug <code className="rounded bg-slate-100 px-1">hosting</code>)
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <HostingPageEditor
        value={content}
        onChange={setContent}
        onPersist={(next) => void save(next)}
      />
      <button
        type="button"
        disabled={saving}
        onClick={() => void save(content)}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save all"}
      </button>
    </div>
  );
}
