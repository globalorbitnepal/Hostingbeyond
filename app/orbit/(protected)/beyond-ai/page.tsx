"use client";

import { useEffect, useState } from "react";

import {
  beyondAiModelsConfig,
  beyondAiPlansConfig,
} from "@/config/beyond-ai-product";

export default function OrbitBeyondAiProductPage() {
  const [json, setJson] = useState("");

  useEffect(() => {
    setJson(
      JSON.stringify(
        { plans: beyondAiPlansConfig, models: beyondAiModelsConfig },
        null,
        2,
      ),
    );
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Beyond AI product</h1>
      <p className="mt-2 text-sm text-slate-600">
        Plans, credits, and models are defined in{" "}
        <code className="rounded bg-slate-100 px-1">
          config/beyond-ai-product.ts
        </code>
        . Edit that file and deploy, or extend this page with CMS storage (slug{" "}
        <code className="rounded bg-slate-100 px-1">beyond-ai-product</code>) in
        a follow-up.
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Stripe: set <code>STRIPE_SECRET_KEY</code> for paid checkout. Dev only:{" "}
        <code>BEYOND_AI_DEV_ACTIVATE_PAID=true</code>.
      </p>
      <pre className="mt-6 max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
        {json}
      </pre>
    </div>
  );
}
