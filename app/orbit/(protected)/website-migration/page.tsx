"use client";

import { useEffect, useState } from "react";

import { routes } from "@/config/routes";
import { WebsiteMigrationPageEditor } from "@/components/orbit/website-migration-page-editor";
import {
  defaultWebsiteMigrationPageContent,
  type CmsWebsiteMigrationPageContent,
} from "@/lib/orbit/website-migration-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitWebsiteMigrationPage() {
  const [content, setContent] = useState<CmsWebsiteMigrationPageContent>(
    defaultWebsiteMigrationPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/website-migration");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsWebsiteMigrationPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/website-migration", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as {
        content?: CmsWebsiteMigrationPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus(`Saved — live on ${routes.websiteMigration}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Website migration page
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          <a
            href={routes.websiteMigration}
            className="text-violet-600 underline"
          >
            {routes.websiteMigration}
          </a>{" "}
          · anchor{" "}
          <a
            href={`${routes.websiteMigration}#plans`}
            className="text-violet-600 underline"
          >
            #plans
          </a>
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <WebsiteMigrationPageEditor
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
