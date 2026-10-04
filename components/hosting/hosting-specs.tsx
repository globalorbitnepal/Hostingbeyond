import type {
  HostingVpsSpecifications,
  HostingWebSpecifications,
} from "@/lib/hosting/product-types";

type SpecRow = { label: string; value: string };

function rowsFromSpecs(
  specs: HostingWebSpecifications | HostingVpsSpecifications,
): SpecRow[] {
  const map: SpecRow[] = [];
  const entries = Object.entries(specs) as Array<[string, string | undefined]>;
  const labels: Record<string, string> = {
    cpuCores: "CPU cores",
    ram: "RAM",
    nvmeStorage: "NVMe storage",
    bandwidth: "Bandwidth",
    ipv4: "IPv4",
    ipv6: "IPv6",
    location: "Location",
    virtualization: "Virtualization",
    operatingSystem: "Operating system",
    rootAccess: "Root access",
    snapshots: "Snapshots",
    backups: "Backups",
    storage: "Storage",
    storageType: "Storage type",
    cpu: "CPU",
    websites: "Websites",
    domains: "Domains",
    emailAccounts: "Email accounts",
    databases: "Databases",
    ssl: "SSL",
    backup: "Backups",
    controlPanel: "Control panel",
    support: "Support",
  };
  for (const [key, value] of entries) {
    if (!value?.trim()) continue;
    map.push({ label: labels[key] ?? key, value });
  }
  return map;
}

export function HostingSpecs({
  heading = "Technical specifications",
  description = "Infrastructure details for this product.",
  specifications,
}: {
  heading?: string;
  description?: string;
  specifications: HostingWebSpecifications | HostingVpsSpecifications;
}) {
  const rows = rowsFromSpecs(specifications);
  if (!rows.length) return null;

  return (
    <section className="hb-band-cream py-16 sm:py-20">
      <div className="hb-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold text-[#2f1c6a]">
            {heading}
          </h2>
          <p className="mt-2 text-[15px] text-slate-600">{description}</p>
        </div>
        <dl className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-2xl border border-[#e9e4ff] bg-white px-4 py-3"
            >
              <dt className="text-[12px] font-bold tracking-wide text-slate-500 uppercase">
                {row.label}
              </dt>
              <dd className="mt-1 text-[15px] font-semibold text-[#2f1c6a]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
