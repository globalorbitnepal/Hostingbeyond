import { OrbitCustomerUsersAdmin } from "@/components/orbit/customer-users-admin";

export default function OrbitUsersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          All customer signups: email, Google, and other OAuth methods, wallet
          balance, purchases, login history, and admin password reset.
        </p>
      </div>
      <OrbitCustomerUsersAdmin />
    </div>
  );
}
