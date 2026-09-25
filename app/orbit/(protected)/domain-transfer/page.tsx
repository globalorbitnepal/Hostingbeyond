"use client";

import { useEffect, useState } from "react";

import { DomainTransferPageEditor } from "@/components/orbit/domain-transfer-page-editor";
import { routes } from "@/config/routes";
import {
  defaultDomainTransferPageContent,
  type CmsDomainTransferPageContent,
} from "@/lib/orbit/domain-transfer-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitDomainTransferPage() {
  const [content, setContent] = useState<CmsDomainTransferPageContent>(
    defaultDomainTransferPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/domain-transfer");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsDomainTransferPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/domain-transfer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as {
        content?: CmsDomainTransferPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus(`Saved — live on ${routes.domainTransfer}`);
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
          Domain transfer page
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          <a href={routes.domainTransfer} className="text-violet-600 underline">
            {routes.domainTransfer}
          </a>{" "}
          · API:{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            POST /api/domains/transfer-check
          </code>
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <DomainTransferPageEditor
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
