/**
 * @deprecated Import from `@/lib/payments/wallet-payment-service` for new code.
 */
export {
  createWalletTopUpCheckoutSession as createWalletTopUpSession,
  isPaymentProviderConfigured,
  normalizeTopUpAmount,
} from "@/lib/payments/wallet-payment-service";

export type { TopUpSessionResult as WalletTopUpResult } from "@/lib/payments/wallet-payment-service";
