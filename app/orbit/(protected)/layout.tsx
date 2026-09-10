import { cookies } from "next/headers";

import { OrbitLoginForm } from "@/components/orbit/login-form";
import { OrbitShell } from "@/components/orbit/shell";
import { getSessionAdmin, ORBIT_SESSION_COOKIE } from "@/lib/orbit/session";

export const metadata = {
  title: "Orbit | HostingBeyond",
  robots: { index: false, follow: false },
};

export default async function OrbitProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const admin = await getSessionAdmin(jar.get(ORBIT_SESSION_COOKIE)?.value);

  if (!admin) {
    return <OrbitLoginForm />;
  }

  return <OrbitShell adminName={admin.displayName}>{children}</OrbitShell>;
}
