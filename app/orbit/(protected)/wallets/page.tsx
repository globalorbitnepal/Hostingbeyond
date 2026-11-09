import { OrbitWalletAdmin } from "@/components/orbit/wallet-admin";

export default function OrbitWalletsPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
          Customers
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Wallet ledger
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Every customer wallet with its full ledger: admin credits, debits,
          Stripe card top-ups, and reversals. Balances shown here are the live
          ledger figure customers spend on hosting and domains.
        </p>
      </div>
      <OrbitWalletAdmin />
    </div>
  );
}
