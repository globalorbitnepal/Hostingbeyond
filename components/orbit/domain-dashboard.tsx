"use client";

import { useEffect, useState } from "react";

export function OrbitDomainDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void fetch("/api/orbit/domain-dashboard")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = [
    ["Customers", stats?.customers],
    ["Domains", stats?.domains],
    ["Active domains", stats?.activeDomains],
    ["Pending orders", stats?.pendingOrders],
    ["Failed orders", stats?.failedOrders],
    ["Pending transfers", stats?.pendingTransfers],
    ["New migrations", stats?.migrationsNew],
    ["API errors (24h)", stats?.providerErrors24h],
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-[#2f1c6a]">
        Domain services
      </h1>
      <p className="text-sm text-slate-600">
        HostingBeyond domain operations — supplier details stay in admin only.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-bold text-slate-500 uppercase">
              {label}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#2f1c6a]">
              {value != null ? String(value) : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
