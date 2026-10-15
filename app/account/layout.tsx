import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PanelAccountChrome } from "@/components/panel/panel-account-chrome";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

import "@/styles/panel.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  return (
    <PanelAccountChrome
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
      }}
    >
      {children}
    </PanelAccountChrome>
  );
}
