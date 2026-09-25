"use client";

import { useEffect, useState } from "react";

import { BusinessEmailProductPageEditor } from "@/components/orbit/business-email-product-page-editor";
import {
  defaultBusinessEmailPageContent,
  type CmsBusinessEmailPageContent,
} from "@/lib/orbit/business-email-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitBusinessEmailPage() {
  const [content, setContent] = useState<CmsBusinessEmailPageContent>(
    defaultBusinessEmailPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/business-email");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
      else setStatus(json.error || "Failed to load");
    })();
  }, []);

  async function save(next: CmsBusinessEmailPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/business-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as {
        content?: CmsBusinessEmailPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus("Saved — live on /business-email");
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
          Business Email page
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Edit the full{" "}
          <a href="/business-email" className="text-violet-600 underline">
            /business-email
          </a>{" "}
          landing page. Slug:{" "}
          <code className="rounded bg-slate-100 px-1">
            business-email-product
          </code>
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <BusinessEmailProductPageEditor
        value={content}
        onChange={setContent}
        onPersist={(next) => void save(next)}
        saving={saving}
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
