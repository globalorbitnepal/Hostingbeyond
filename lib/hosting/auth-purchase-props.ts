import { resolveHostingPurchaseContext } from "./resolve-purchase-context";
import {
  parseHostingPurchaseIntentFromRecord,
  type HostingPurchaseIntent,
} from "./purchase-intent";
import type { ResolvedHostingPurchaseContext } from "./resolve-purchase-context";
import { hostingCheckoutPath } from "./purchase-intent";

export async function getAuthHostingPurchaseProps(
  params: Record<string, string | string[] | undefined>,
): Promise<{
  purchaseContext: ResolvedHostingPurchaseContext | null;
  purchaseSelectionInvalid: boolean;
  intent: HostingPurchaseIntent | null;
}> {
  const intent = parseHostingPurchaseIntentFromRecord(params);
  const hasKeys =
    Boolean(params.product) || Boolean(params.plan) || Boolean(params.billing);

  if (!intent) {
    return {
      purchaseContext: null,
      purchaseSelectionInvalid: hasKeys,
      intent: null,
    };
  }

  const purchaseContext = await resolveHostingPurchaseContext(intent);
  return {
    purchaseContext,
    purchaseSelectionInvalid: hasKeys && !purchaseContext,
    intent,
  };
}

export function redirectIfLoggedInWithIntent(
  isLoggedIn: boolean,
  intent: HostingPurchaseIntent | null,
): string | null {
  if (!isLoggedIn || !intent) return null;
  return hostingCheckoutPath(intent);
}
