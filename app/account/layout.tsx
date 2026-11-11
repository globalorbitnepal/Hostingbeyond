import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PanelAccountChrome } from "@/components/panel/panel-account-chrome";
import { routes } from "@/config/routes";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { getSiteSettings } from "@/lib/orbit/content";
import { sanitizeTrustpilotUrl } from "@/lib/panel/trustpilot";

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
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem("hb-panel-theme");if(t!=="dark"&&t!=="light"){t="light";}document.documentElement.dataset.hbTheme=t;}catch(e){}})();`;

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

  const settings = await getSiteSettings();

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      <PanelAccountChrome
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
          hasPassword: Boolean(user.passwordHash),
        }}
        trustpilotUrl={sanitizeTrustpilotUrl(settings.trustpilotUrl)}
        trustpilotLabel={settings.trustpilotLabel}
      >
        {children}
      </PanelAccountChrome>
    </>
  );
}
