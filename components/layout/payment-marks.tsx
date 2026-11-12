import type { CmsFooterPayment } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

type Brand = CmsFooterPayment["brand"];

/**
 * Official brand marks (Wikimedia file paths of the published logos).
 * Stripe Checkout cards: Visa, Mastercard, American Express, Discover,
 * Diners Club, JCB, UnionPay, plus Apple Pay and Google Pay wallets.
 */
const MARKS: Record<
  Brand,
  { src: string; label: string; width: number; height: number }
> = {
  visa: {
    src: "/images/payments/visa.svg",
    label: "Visa",
    width: 48,
    height: 16,
  },
  mastercard: {
    src: "/images/payments/mastercard.svg",
    label: "Mastercard",
    width: 36,
    height: 22,
  },
  amex: {
    src: "/images/payments/amex.svg",
    label: "American Express",
    width: 58,
    height: 37,
  },
  discover: {
    src: "/images/payments/discover.svg",
    label: "Discover",
    width: 72,
    height: 18,
  },
  jcb: {
    src: "/images/payments/jcb.svg",
    label: "JCB",
    width: 32,
    height: 24,
  },
  diners: {
    src: "/images/payments/diners.svg",
    label: "Diners Club",
    width: 58,
    height: 37,
  },
  unionpay: {
    src: "/images/payments/unionpay.svg",
    label: "UnionPay",
    width: 40,
    height: 24,
  },
  applepay: {
    src: "/images/payments/applepay.svg",
    label: "Apple Pay",
    width: 52,
    height: 22,
  },
  googlepay: {
    src: "/images/payments/googlepay.svg",
    label: "Google Pay",
    width: 56,
    height: 22,
  },
  stripe: {
    src: "/images/payments/stripe.svg",
    label: "Stripe",
    width: 56,
    height: 22,
  },
};

export function PaymentMark({ brand }: { brand: Brand }) {
  const mark = MARKS[brand];
  return (
    <span className="inline-flex h-11 min-w-[52px] items-center justify-center rounded-[10px] border border-slate-200 bg-white px-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      {/* Real SVG wordmarks — next/image rasterizes them poorly at this size. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mark.src}
        alt={mark.label}
        width={mark.width}
        height={mark.height}
        className={cn("block object-contain")}
        style={{ width: mark.width, height: mark.height }}
        draggable={false}
      />
    </span>
  );
}
