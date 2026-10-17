import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { getCustomerInvoiceDetail } from "@/lib/billing/customer-invoices";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

type Props = { params: Promise<{ publicId: string }> };

export default async function AccountInvoiceDetailPage({ params }: Props) {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) redirect(routes.login);

  const { publicId } = await params;
  const invoice = await getCustomerInvoiceDetail(user.id, publicId);
  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="hb-panel-card space-y-4 p-6 sm:p-8">
        <Link
          href={routes.accountInvoices}
          className="text-sm font-semibold text-[#673de6]"
        >
          ← All invoices
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-slate-950">
          {invoice.invoiceNumber}
        </h1>
        <p className="text-sm text-slate-500">
          Status: {invoice.status}
          {invoice.issuedAt
            ? ` · Issued ${new Date(invoice.issuedAt).toLocaleDateString()}`
            : ""}
        </p>
        <table className="w-full text-sm">
          <tbody>
            {invoice.lineItems.map((line) => (
              <tr key={line.description} className="border-b border-slate-100">
                <td className="py-2">{line.description}</td>
                <td className="py-2 text-right">
                  {line.lineTotal} {invoice.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-slate-500">Subtotal</dt>
          <dd className="text-right">
            {invoice.subtotal} {invoice.currency}
          </dd>
          <dt className="text-slate-500">Tax</dt>
          <dd className="text-right">
            {invoice.tax} {invoice.currency}
          </dd>
          <dt className="font-semibold text-slate-800">Total</dt>
          <dd className="text-right font-semibold">
            {invoice.total} {invoice.currency}
          </dd>
        </dl>
        {invoice.domainOrderPublicId ? (
          <p className="text-xs text-slate-500">
            Order{" "}
            <Link
              href={`${routes.accountOrders}/${invoice.domainOrderPublicId}`}
              className="font-semibold text-[#673de6]"
            >
              {invoice.domainOrderPublicId}
            </Link>
          </p>
        ) : null}
        <a
          href={`/api/account/invoices/${invoice.publicId}/pdf`}
          className="inline-flex rounded-lg bg-[#673de6] px-4 py-2 text-sm font-semibold text-white"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
