import Link from "next/link";
import { redirect } from "next/navigation";

import { getPlanConfig } from "@/config/beyond-ai-product";
import { beyondAiWorkspacePath } from "@/config/beyond-ai-product";

export const metadata = {
  title: "Beyond AI — You're ready to build",
  robots: { index: false },
};

export default async function BeyondAiCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; dev?: string }>;
}) {
  const params = await searchParams;
  if (!params.plan) redirect("/beyond-ai");
  const plan = getPlanConfig(params.plan);
  return (
    <div className="hb-band-cream flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-[28px] border border-[#e9e4ff] bg-white p-8 text-center shadow-xl">
        <p className="text-[12px] font-extrabold tracking-wide text-[#673de6] uppercase">
          Payment successful
        </p>
        <h1 className="font-heading mt-3 text-[2rem] font-extrabold text-[#2f1c6a]">
          You&apos;re ready to build.
        </h1>
        {params.dev === "1" ? (
          <p className="mt-2 text-[13px] font-semibold text-amber-700">
            Development activation — not a real charge.
          </p>
        ) : null}
        <dl className="mt-8 space-y-3 text-left text-[14px]">
          <div className="flex justify-between">
            <dt className="text-[#64748b]">Plan</dt>
            <dd className="font-extrabold text-[#2f1c6a]">{plan.shortName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#64748b]">AI credit</dt>
            <dd className="font-extrabold text-[#2f1c6a]">
              ${plan.includedCreditUsd.toFixed(2)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#64748b]">Hosting</dt>
            <dd className="font-extrabold text-emerald-600">Included</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#64748b]">Status</dt>
            <dd className="font-extrabold text-emerald-600">Active</dd>
          </div>
        </dl>
        <Link
          href={beyondAiWorkspacePath()}
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-[14px] font-extrabold text-white"
        >
          Open Beyond AI
        </Link>
        <Link
          href="/"
          className="mt-3 block text-[13px] font-bold text-[#673de6]"
        >
          Back to HostingBeyond
        </Link>
      </div>
    </div>
  );
}
