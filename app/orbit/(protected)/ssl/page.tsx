"use client";

import { useEffect, useState } from "react";

import { SslPageEditor } from "@/components/orbit/ssl-page-editor";
import { readResponseError } from "@/lib/orbit/read-response-error";
import {
  defaultSslPageContent,
  type CmsSslPageContent,
} from "@/lib/orbit/ssl-page-content";

export default function OrbitSslPage() {
  const [content, setContent] = useState<CmsSslPageContent>(
    defaultSslPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/ssl");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
      else setStatus(json.error || "Failed to load");
    })();
  }, []);

  async function save(next: CmsSslPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/ssl", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      setStatus("Saved — live on /web-hosting/ssl");
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
          SSL certificates page
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Edit every section of{" "}
          <a href="/web-hosting/ssl" className="text-violet-600 underline">
            /web-hosting/ssl
          </a>{" "}
          — hero, stats, features, SSL plans, certificate types, risk
          comparison, reviews, and FAQs.
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <SslPageEditor
        value={content}
        onChange={setContent}
        onPersist={(next) => void save(next)}
        saving={saving}
      />
    </div>
  );
}
