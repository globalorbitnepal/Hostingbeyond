import Link from "next/link";

import { DomainAdminTable } from "@/components/orbit/domain-admin-table";
import { prisma } from "@/lib/prisma";
import { summarizeDomains } from "@/lib/panel/domain-status";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function OrbitCustomerDomainsPage() {
  const rows = await prisma.domainRegistration.findMany({
    orderBy: [{ expiresAt: "asc" }, { createdAt: "desc" }],
    take: 300,
    select: {
      id: true,
      domain: true,
      status: true,
      registrarProvider: true,
      autoRenew: true,
      transferLock: true,
      expiresAt: true,
      createdAt: true,
      user: { select: { email: true, name: true } },
    },
  });

  const summary = summarizeDomains(
    rows.map((row) => ({ status: row.status, expiresAt: row.expiresAt })),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Customer domains
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Every registration on the platform with its owner, registrar, expiry
          and renewal state. Read-only — customers manage records from their own
          panel so registrar calls stay auditable per user.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: summary.total },
          { label: "Active", value: summary.active },
          { label: "Expiring", value: summary.expiring },
          { label: "Expired", value: summary.expired },
          { label: "Pending", value: summary.pending },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <DomainAdminTable
        rows={rows.map((row) => ({
          id: row.id,
          domain: row.domain,
          status: row.status,
          registrarProvider: row.registrarProvider,
          autoRenew: row.autoRenew,
          transferLock: row.transferLock,
          expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
          ownerEmail: row.user?.email ?? null,
          ownerName: row.user?.name ?? null,
        }))}
      />

      <p className="text-sm">
        <Link
          href="/orbit/domain-orders"
          className="font-semibold text-[#673de6]"
        >
          Domain orders
        </Link>
        {" · "}
        <Link
          href="/orbit/domain-services"
          className="font-semibold text-[#673de6]"
        >
          Domain services
        </Link>
      </p>
    </div>
  );
}
