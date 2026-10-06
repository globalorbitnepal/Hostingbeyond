import { OrbitWalletAdmin } from "@/components/orbit/wallet-admin";

export default function OrbitWalletsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Customer wallets
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Search customers, review Stripe top-ups, and apply audited manual
          credits or debits. Payment wallet credits from Stripe only occur via
          verified webhooks.
        </p>
      </div>
      <OrbitWalletAdmin />
    </div>
  );
}
