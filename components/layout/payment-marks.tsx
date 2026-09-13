import type { CmsFooterPayment } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

type Brand = CmsFooterPayment["brand"];

const MARKS: Record<
  Brand,
  { src: string; label: string; width: number; className: string }
> = {
  visa: {
    src: "/images/payments/visa.svg",
    label: "Visa",
    width: 52,
    className: "h-9 w-[52px]",
  },
  mastercard: {
    src: "/images/payments/mastercard.svg",
    label: "Mastercard",
    width: 52,
    className: "h-9 w-[52px]",
  },
  amex: {
    src: "/images/payments/amex.svg",
    label: "American Express",
    width: 52,
    className: "h-9 w-[52px]",
  },
  discover: {
    src: "/images/payments/discover.svg",
    label: "Discover",
    width: 70,
    className: "h-9 w-[70px]",
  },
  jcb: {
    src: "/images/payments/jcb.svg",
    label: "JCB",
    width: 46,
    className: "h-9 w-[46px]",
  },
  diners: {
    src: "/images/payments/diners.svg",
    label: "Diners Club",
    width: 46,
    className: "h-9 w-[46px]",
  },
  unionpay: {
    src: "/images/payments/unionpay.svg",
    label: "UnionPay",
    width: 58,
    className: "h-9 w-[58px]",
  },
  applepay: {
    src: "/images/payments/applepay.svg",
    label: "Apple Pay",
    width: 72,
    className: "h-9 w-[72px]",
  },
  googlepay: {
    src: "/images/payments/googlepay.svg",
    label: "Google Pay",
    width: 78,
    className: "h-9 w-[78px]",
  },
  stripe: {
    src: "/images/payments/stripe.svg",
    label: "Powered by Stripe",
    width: 118,
    className: "h-9 w-[118px]",
  },
};

export function PaymentMark({ brand }: { brand: Brand }) {
  const mark = MARKS[brand];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mark.src}
      alt={mark.label}
      width={mark.width}
      height={36}
      className={cn("shrink-0 object-contain object-center", mark.className)}
      draggable={false}
    />
  );
}
