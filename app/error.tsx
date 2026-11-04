"use client";

import { useEffect } from "react";
import Link from "next/link";

import { routes } from "@/config/routes";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app-error", error.digest ?? "no-digest");
  }, [error]);

  return (
    <div className="hb-band-cream min-h-[60vh] py-16 sm:py-24">
      <div className="hb-shell mx-auto max-w-lg text-center">
        <p className="text-[13px] font-bold tracking-[0.2em] text-slate-500 uppercase">
          Something went wrong
        </p>
        <h1 className="font-heading mt-3 text-[2rem] font-extrabold tracking-[-0.03em] text-[#2f1c6a]">
          We could not load this page
        </h1>
        <p className="mt-3 text-[15px] text-slate-600">
          Try again. If this keeps happening, return home or contact support.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center rounded-full bg-[#673de6] px-5 text-[14px] font-bold text-white"
          >
            Try again
          </button>
          <Link
            href={routes.home}
            className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-bold text-slate-800"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
