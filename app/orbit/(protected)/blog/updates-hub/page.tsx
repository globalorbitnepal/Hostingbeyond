"use client";

import { useEffect, useState } from "react";

import { UpdatesHubPageEditor } from "@/components/orbit/updates-hub-page-editor";
import {
  defaultUpdatesHubPageContent,
  type CmsUpdatesHubPageContent,
  UPDATES_BASE,
} from "@/lib/orbit/updates-hub-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitUpdatesHubPage() {
  const [content, setContent] = useState<CmsUpdatesHubPageContent>(
    defaultUpdatesHubPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/updates-hub");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsUpdatesHubPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/updates-hub", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as {
        content?: CmsUpdatesHubPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus(`Saved — live on ${UPDATES_BASE}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Product updates page</h1>
        <p className="mt-1 text-sm text-slate-500">
          Public URL:{" "}
          <a href={UPDATES_BASE} className="font-semibold text-[#673de6]">
            {UPDATES_BASE}
          </a>
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <UpdatesHubPageEditor value={content} onChange={setContent} />
      <button
        type="button"
        disabled={saving}
        onClick={() => void save(content)}
        className="rounded-xl bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save updates page"}
      </button>
    </div>
  );
}
