import { cookies } from "next/headers";

import { OrbitLoginForm } from "@/components/orbit/login-form";
import { OrbitShell } from "@/components/orbit/shell";
import { getSessionAdmin, ORBIT_SESSION_COOKIE } from "@/lib/orbit/session";
import { orbitAccessForAdmin } from "@/lib/orbit/staff-access";

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

  const access = orbitAccessForAdmin(admin.id);
  if (access === "none") {
    return (
      <div className="notranslate flex min-h-dvh items-center justify-center bg-[#e8eeff] px-4 text-slate-900">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold">Orbit access denied</h1>
          <p className="mt-2 text-sm text-slate-600">
            This account is not authorized. Add this user&apos;s id to{" "}
            <code className="rounded bg-slate-100 px-1">
              ORBIT_FULL_ADMIN_IDS
            </code>{" "}
            or{" "}
            <code className="rounded bg-slate-100 px-1">
              ORBIT_SUPPORT_STAFF_IDS
            </code>{" "}
            in server configuration, or enable the documented legacy bootstrap
            flag only during migration.
          </p>
          <p className="mt-4 text-sm">
            <a
              href="/api/orbit/auth/logout"
              className="text-[#2f1c6a] underline underline-offset-2"
            >
              Sign out of Orbit
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <OrbitShell
      adminName={admin.displayName}
      orbitAccess={orbitAccessForAdmin(admin.id)}
    >
      {children}
    </OrbitShell>
  );
}
