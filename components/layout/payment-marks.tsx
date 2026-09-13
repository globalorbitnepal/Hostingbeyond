import type { ReactNode } from "react";

import type { CmsFooterPayment } from "@/lib/orbit/defaults";
import { cn } from "@/lib/utils";

type Brand = CmsFooterPayment["brand"];

function Chip({
  label,
  wide,
  amex,
  pill,
  children,
}: {
  label: string;
  wide?: boolean;
  amex?: boolean;
  pill?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex h-[40px] items-center justify-center overflow-hidden border border-slate-200/90 bg-white shadow-[0_8px_18px_-14px_rgba(15,23,42,0.4)]",
        pill ? "min-w-[118px] rounded-full px-3.5" : "rounded-[9px] px-2",
        amex && "border-[#005bb0] bg-[#006FCF] px-0",
        wide && !pill ? "min-w-[72px]" : !pill && "min-w-[58px]",
      )}
    >
      {children}
    </span>
  );
}

/** Official Visa wordmark (navy). */
function VisaLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[34px]" aria-hidden>
      <path
        fill="#1A1F71"
        d="M9.112 8.262 5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 0 1 .894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 0 1 1.913.336l.34-1.59a5.207 5.207 0 0 0-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 0 0-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656 1.02-2.815.588 2.815zm-8.16-4.84-1.603 7.496H8.34l1.605-7.496z"
      />
    </svg>
  );
}

/** Official Mastercard interlocking circles. */
function MastercardLogo() {
  return (
    <svg viewBox="0 0 40 24" className="h-[26px] w-[42px]" aria-hidden>
      <circle cx="15.2" cy="12" r="8.4" fill="#EB001B" />
      <circle cx="24.8" cy="12" r="8.4" fill="#F79E1B" />
      <path
        fill="#FF5F00"
        d="M20 5.4a8.38 8.38 0 0 0-3.28 6.6A8.38 8.38 0 0 0 20 18.6a8.38 8.38 0 0 0 3.28-6.6A8.38 8.38 0 0 0 20 5.4z"
      />
    </svg>
  );
}

/** American Express network badge. */
function AmexLogo() {
  return (
    <svg viewBox="0 0 62 32" className="h-[42px] w-[62px]" aria-hidden>
      <rect width="62" height="32" rx="9" fill="#006FCF" />
      <text
        x="31"
        y="14"
        fill="#fff"
        fontSize="7"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.6"
      >
        AMERICAN
      </text>
      <text
        x="31"
        y="23.5"
        fill="#fff"
        fontSize="7"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.8"
      >
        EXPRESS
      </text>
    </svg>
  );
}

function DiscoverLogo() {
  return (
    <svg viewBox="0 0 78 24" className="h-[16px] w-[74px]" aria-hidden>
      <text
        x="0"
        y="17"
        fill="#111"
        fontSize="12"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.2"
      >
        DISCOVER
      </text>
      <circle cx="73" cy="16.2" r="4.2" fill="#F76F00" />
    </svg>
  );
}

function JcbLogo() {
  return (
    <svg viewBox="0 0 46 28" className="h-[28px] w-[46px]" aria-hidden>
      <rect width="15.2" height="28" rx="3" fill="#0E4C96" />
      <rect x="15.4" width="15.2" height="28" rx="3" fill="#D3222A" />
      <rect x="30.8" width="15.2" height="28" rx="3" fill="#28A346" />
      <text
        x="7.6"
        y="18"
        fill="#fff"
        fontSize="11"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        J
      </text>
      <text
        x="23"
        y="18"
        fill="#fff"
        fontSize="11"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        C
      </text>
      <text
        x="38.4"
        y="18"
        fill="#fff"
        fontSize="11"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        B
      </text>
    </svg>
  );
}

function DinersLogo() {
  return (
    <svg viewBox="0 0 40 28" className="h-[28px] w-[40px]" aria-hidden>
      <rect width="40" height="28" rx="6" fill="#0079BE" />
      <circle cx="20" cy="14" r="8.4" fill="#fff" />
      <path fill="#0079BE" d="M16.2 8.2h7.6v11.6h-7.6z" />
      <circle cx="16.6" cy="14" r="5.4" fill="#fff" />
      <circle cx="23.4" cy="14" r="5.4" fill="#fff" />
    </svg>
  );
}

function UnionPayLogo() {
  return (
    <svg viewBox="0 0 64 28" className="h-[28px] w-[64px]" aria-hidden>
      <rect width="21.4" height="28" rx="2" fill="#E21836" />
      <rect x="21.4" width="21.2" height="28" fill="#00447C" />
      <rect x="42.6" width="21.4" height="28" rx="2" fill="#007B5F" />
      <text
        x="32"
        y="17.4"
        fill="#fff"
        fontSize="7.4"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        UnionPay
      </text>
    </svg>
  );
}

function ApplePayLogo() {
  return (
    <svg viewBox="0 0 58 22" className="h-[18px] w-[54px]" aria-hidden>
      <path
        fill="#111"
        d="M12.35 4.05c.72-.86 1.2-2.05 1.07-3.25-1.04.04-2.3.7-3.05 1.56-.7.8-1.32 2.08-1.08 3.24 1.16.09 2.34-.56 3.06-1.55zM12.62 5.62c-1.78-.1-3.28 1.02-4.15 1.02-.98 0-2.48-1-4.02-.97-2.06.03-3.96 1.2-5.02 3.05-2.14 3.7-.55 9.18 1.53 12.18 1.02 1.47 2.22 3.1 3.8 3.04 1.52-.06 2.1-.98 3.94-.98 1.82 0 2.34.98 3.96.95 1.64-.03 2.68-1.48 3.68-2.96 1.15-1.7 1.62-3.35 1.64-3.43-.04-.02-3.18-1.22-3.22-4.84-.03-3.04 2.48-4.5 2.6-4.58-1.42-2.1-3.62-2.33-4.74-2.38z"
      />
      <text
        x="22.5"
        y="16.2"
        fill="#111"
        fontSize="13"
        fontWeight="600"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        Pay
      </text>
    </svg>
  );
}

function GooglePayLogo() {
  return (
    <svg viewBox="0 0 70 24" className="h-[18px] w-[66px]" aria-hidden>
      <g transform="translate(0 1.2) scale(.9)">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </g>
      <text
        x="26"
        y="16.6"
        fill="#3C4043"
        fontSize="12.5"
        fontWeight="500"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        Pay
      </text>
    </svg>
  );
}

function StripeLogo() {
  return (
    <svg viewBox="0 0 108 18" className="h-[14px] w-[108px]" aria-hidden>
      <text
        x="0"
        y="13.5"
        fill="#6B7280"
        fontSize="9"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        Powered by
      </text>
      <text
        x="56"
        y="14"
        fill="#635BFF"
        fontSize="13"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        stripe
      </text>
    </svg>
  );
}

const MARKS: Record<Brand, () => ReactNode> = {
  visa: () => (
    <Chip label="Visa">
      <VisaLogo />
    </Chip>
  ),
  mastercard: () => (
    <Chip label="Mastercard">
      <MastercardLogo />
    </Chip>
  ),
  amex: () => (
    <Chip label="American Express" amex>
      <AmexLogo />
    </Chip>
  ),
  discover: () => (
    <Chip label="Discover" wide>
      <DiscoverLogo />
    </Chip>
  ),
  jcb: () => (
    <Chip label="JCB">
      <JcbLogo />
    </Chip>
  ),
  diners: () => (
    <Chip label="Diners Club">
      <DinersLogo />
    </Chip>
  ),
  unionpay: () => (
    <Chip label="UnionPay" wide>
      <UnionPayLogo />
    </Chip>
  ),
  applepay: () => (
    <Chip label="Apple Pay" wide>
      <ApplePayLogo />
    </Chip>
  ),
  googlepay: () => (
    <Chip label="Google Pay" wide>
      <GooglePayLogo />
    </Chip>
  ),
  stripe: () => (
    <Chip label="Powered by Stripe" pill wide>
      <StripeLogo />
    </Chip>
  ),
};

export function PaymentMark({ brand }: { brand: Brand }) {
  return MARKS[brand]();
}
