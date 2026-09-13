import type { CmsFooterPayment } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

type Brand = CmsFooterPayment["brand"];

const SRC: Record<
  Brand,
  { src: string; label: string; wide?: boolean; pill?: boolean }
> = {
  visa: { src: "/images/payments/visa.svg", label: "Visa" },
  mastercard: { src: "/images/payments/mastercard.svg", label: "Mastercard" },
  amex: { src: "/images/payments/amex.svg", label: "American Express" },
  discover: {
    src: "/images/payments/discover.svg",
    label: "Discover",
    wide: true,
  },
  jcb: { src: "/images/payments/jcb.svg", label: "JCB" },
  diners: { src: "/images/payments/diners.svg", label: "Diners Club" },
  unionpay: {
    src: "/images/payments/unionpay.svg",
    label: "UnionPay",
    wide: true,
  },
  applepay: {
    src: "/images/payments/applepay.svg",
    label: "Apple Pay",
    wide: true,
  },
  googlepay: {
    src: "/images/payments/googlepay.svg",
    label: "Google Pay",
    wide: true,
  },
  stripe: {
    src: "/images/payments/stripe.svg",
    label: "Powered by Stripe",
    wide: true,
    pill: true,
  },
};

export function PaymentMark({ brand }: { brand: Brand }) {
  const mark = SRC[brand];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mark.src}
      alt={mark.label}
      width={mark.wide ? 92 : 52}
      height={32}
      className={cn(
        "h-9 w-auto object-contain",
        mark.pill
          ? "min-w-[92px]"
          : mark.wide
            ? "min-w-[70px]"
            : "min-w-[52px]",
      )}
      draggable={false}
    />
  );
}
