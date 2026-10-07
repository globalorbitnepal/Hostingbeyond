"use client";

import { useEffect, useState } from "react";

import { ContactPageEditor } from "@/components/orbit/contact-page-editor";
import { routes } from "@/config/routes";
import {
  defaultContactPageContent,
  type CmsContactPageContent,
} from "@/lib/orbit/contact-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitContactPage() {
  const [content, setContent] = useState<CmsContactPageContent>(
    defaultContactPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/contact");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsContactPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as { content?: CmsContactPageContent };
      if (json.content) setContent(json.content);
      setStatus(`Saved — live on ${routes.contact}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Contact page</h1>
        <p className="mt-1 text-sm text-slate-500">
          Public URL:{" "}
          <a href={routes.contact} className="font-semibold text-[#673de6]">
            {routes.contact}
          </a>
          . Global contact email/phone: Orbit → Settings.
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <ContactPageEditor value={content} onChange={setContent} />
      <button
        type="button"
        disabled={saving}
        onClick={() => void save(content)}
        className="rounded-xl bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save contact page"}
      </button>
    </div>
  );
}
