import { OrbitCustomerUsersAdmin } from "@/components/orbit/customer-users-admin";

export default function OrbitUsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
          Customers
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Users &amp; wallets
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Every registered customer with name, email, country, sign-in methods,
          full wallet control (add, remove, reverse credits), purchase history,
          and a password setter for Google-only accounts — no current password
          required.
        </p>
      </div>
      <OrbitCustomerUsersAdmin />
    </div>
  );
}
