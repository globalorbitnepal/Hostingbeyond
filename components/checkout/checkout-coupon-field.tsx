"use client";

import { useState } from "react";

export function CheckoutCouponField({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className={className}>
      {!open ? (
        <button
          type="button"
          className="text-[13px] font-semibold text-[var(--hb-co-primary)] hover:underline"
          onClick={() => setOpen(true)}
        >
          Have a coupon code?
        </button>
      ) : (
        <div className="space-y-2">
          <label className="text-[12px] font-bold tracking-wide text-[var(--hb-co-text-muted)] uppercase">
            Coupon code
          </label>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setMessage(null);
              }}
              placeholder="Enter code"
              className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--hb-co-border)] bg-white px-3 text-[14px]"
              autoComplete="off"
            />
            <button
              type="button"
              className="hb-checkout-premium__btn-primary h-11 shrink-0 px-5"
              onClick={() => {
                const trimmed = code.trim();
                if (!trimmed) {
                  setMessage("Enter a coupon code to apply.");
                  return;
                }
                setMessage(
                  "Coupons are validated at payment. Your total may update before you are charged.",
                );
              }}
            >
              Apply
            </button>
          </div>
          {message ? (
            <p
              className="text-[12px] text-[var(--hb-co-text-muted)]"
              role="status"
            >
              {message}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
