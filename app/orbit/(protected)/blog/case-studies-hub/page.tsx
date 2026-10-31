"use client";

import { useEffect, useState } from "react";

import { CaseStudiesHubPageEditor } from "@/components/orbit/case-studies-hub-page-editor";
import { CASE_STUDIES_BASE } from "@/lib/case-studies/paths";
import {
  defaultCaseStudiesHubPageContent,
  type CmsCaseStudiesHubPageContent,
} from "@/lib/orbit/case-studies-hub-page-content";
import { readResponseError } from "@/lib/orbit/read-response-error";

export default function OrbitCaseStudiesHubPage() {
  const [content, setContent] = useState<CmsCaseStudiesHubPageContent>(
    defaultCaseStudiesHubPageContent(),
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/orbit/content/case-studies-hub");
      const json = await res.json();
      if (res.ok && json.content) setContent(json.content);
    })();
  }, []);

  async function save(next: CmsCaseStudiesHubPageContent) {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/orbit/content/case-studies-hub", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        const parsed = await readResponseError(res, "Save failed");
        throw new Error(parsed.text);
      }
      const json = (await res.json()) as {
        content?: CmsCaseStudiesHubPageContent;
      };
      if (json.content) setContent(json.content);
      setStatus(`Saved — live on ${CASE_STUDIES_BASE}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Case studies hub</h1>
        <p className="mt-1 text-sm text-slate-500">
          Full page editor for{" "}
          <a href={CASE_STUDIES_BASE} className="font-semibold text-[#673de6]">
            {CASE_STUDIES_BASE}
          </a>
          — SEO, hero, intro, every case study, FAQ and CTA. Premium layout with
          no photos.
        </p>
        {status ? (
          <p className="mt-2 text-sm text-slate-600">{status}</p>
        ) : null}
      </div>
      <CaseStudiesHubPageEditor value={content} onChange={setContent} />
      <button
        type="button"
        disabled={saving}
        onClick={() => void save(content)}
        className="rounded-xl bg-[#673de6] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save case studies page"}
      </button>
    </div>
  );
}
