import { PanelTldCatalog } from "@/components/panel/panel-tld-catalog";
import { loadLiveDomainTlds } from "@/lib/panel/live-domain-tlds";

export const dynamic = "force-dynamic";

export default async function AccountDomainTldListPage() {
  const liveTlds = await loadLiveDomainTlds();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <header>
        <p className="text-[11px] font-bold tracking-[0.18em] text-[var(--hb-p-muted)] uppercase">
          Domains
        </p>
        <h1 className="font-heading mt-1 text-3xl font-extrabold tracking-tight">
          TLD list
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--hb-p-muted)]">
          Every extension we sell, with the same Orbit 1st-year and renewal
          rates used at checkout. Missing or unverified TLDs are not listed.
        </p>
      </header>
      <PanelTldCatalog liveTlds={liveTlds} heading="Verified TLD catalogue" />
    </div>
  );
}
