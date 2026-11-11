"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { OpsDashboardView } from "@/components/orbit/ops-dashboard-view";
import type { OpsSnapshot } from "@/lib/orbit/ops-dashboard-types";

export default function OrbitDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<OpsSnapshot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const access = await fetch("/api/orbit/me");
      const me = (await access.json()) as { orbitAccess?: string };
      if (me.orbitAccess === "support_only") {
        router.replace("/orbit/beyond-master/support-queue");
        return;
      }
      const res = await fetch("/api/orbit/ops", { cache: "no-store" });
      const json = (await res.json()) as OpsSnapshot & { error?: string };
      if (!res.ok) {
        setError(json.error || "Failed to load operations");
        return;
      }
      setData(json);
    })();
  }, [router]);

  return (
    <div>
      {error ? (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      ) : null}
      {!data && !error ? (
        <p className="text-sm text-slate-500">Loading live operations…</p>
      ) : null}
      {data ? <OpsDashboardView data={data} /> : null}
    </div>
  );
}
