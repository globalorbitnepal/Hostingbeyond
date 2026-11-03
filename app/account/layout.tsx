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

/**
 * Applies the saved panel theme before first paint.
 *
 * Without this the cream theme flashes for one frame on a dark-mode session,
 * which is exactly the "text hard to read" complaint we are fixing. The script
 * is intentionally tiny and dependency-free.
 */
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem("hb-panel-theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.hbTheme=t;}catch(e){}})();`;

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
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      <PanelAccountChrome
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
        }}
      >
        {children}
      </PanelAccountChrome>
    </>
  );
}
