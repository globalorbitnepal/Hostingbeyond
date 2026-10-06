import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AuthPageView } from "@/components/auth/login-page";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import {
  domainCheckoutPath,
  parseDomainListFromSearchParams,
} from "@/lib/domains/domain-purchase-intent";
import {
  getAuthHostingPurchaseProps,
  redirectIfLoggedInWithIntent,
} from "@/lib/hosting/auth-purchase-props";
import { getLoginPage } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Login — HostingBeyond",
  description: "Sign in to manage your HostingBeyond hosting services.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );

  const { purchaseContext, purchaseSelectionInvalid, intent } =
    await getAuthHostingPurchaseProps(params);

  const checkoutRedirect = redirectIfLoggedInWithIntent(Boolean(user), intent);
  if (checkoutRedirect) redirect(checkoutRedirect);
  const domainList = parseDomainListFromSearchParams(params);
  if (user && domainList.length) redirect(domainCheckoutPath(domainList));
  const next = params.next;
  if (
    user &&
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//")
  ) {
    redirect(next);
  }
  if (user) redirect("/account");

  const content = await getLoginPage();
  return (
    <Suspense>
      <AuthPageView
        content={content}
        mode="login"
        purchaseContext={purchaseContext}
        purchaseSelectionInvalid={purchaseSelectionInvalid}
      />
    </Suspense>
  );
}
