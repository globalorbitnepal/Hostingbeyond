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
  getAuthHostingPurchaseProps,
  redirectIfLoggedInWithIntent,
} from "@/lib/hosting/auth-purchase-props";
import { getLoginPage } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Sign up — HostingBeyond",
  description: "Create a HostingBeyond account and start hosting in minutes.",
};

export default async function SignupPage({
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
  if (user) redirect("/account");

  const content = await getLoginPage();
  return (
    <Suspense>
      <AuthPageView
        content={content}
        mode="signup"
        purchaseContext={purchaseContext}
        purchaseSelectionInvalid={purchaseSelectionInvalid}
      />
    </Suspense>
  );
}
