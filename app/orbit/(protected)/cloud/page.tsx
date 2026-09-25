"use client";

import { useEffect, useState } from "react";

import { CloudHostingPageEditor } from "@/components/orbit/cloud-hosting-page-editor";
import {
  defaultCloudHostingPageContent,
  type CmsCloudHostingPageContent,
} from "@/lib/orbit/cloud-hosting-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitCloudPage() {
  const [content, setContent] = useState<CmsCloudHostingPageContent>(
    defaultCloudHostingPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/cloud");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsCloudHostingPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/cloud", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as {
        content?: CmsCloudHostingPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus("Saved — live on /cloud");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Cloud hosting page</h1>
        <p className="mt-1 text-sm text-slate-600">
          <a href="/cloud" className="text-violet-600 underline">
            /cloud
          </a>
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <CloudHostingPageEditor
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
