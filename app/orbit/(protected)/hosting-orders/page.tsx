import { OrbitHostingOrdersAdmin } from "@/components/orbit/hosting-orders-admin";

export default function OrbitHostingOrdersPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
          Hosting
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Customer hosting orders
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Every hosting purchase with the websites customers requested on it.
          Payment is confirmed by Stripe webhooks; staff move the order to
          Active once provisioning finishes, and only then can customers create
          sites.
        </p>
      </div>
      <OrbitHostingOrdersAdmin />
    </div>
  );
}
