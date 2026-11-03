import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { getCustomerInvoiceDetail } from "@/lib/billing/customer-invoices";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { formatDomainDate } from "@/lib/panel/domain-status";

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
    <div className="mx-auto w-full max-w-3xl">
      <div className="hb-panel-card space-y-4 p-6 sm:p-8">
        <Link href={routes.accountInvoices} className="hb-link text-sm">
          ← All invoices
        </Link>
        <h1 className="hb-h1">{invoice.invoiceNumber}</h1>
        <p className="hb-muted text-sm">
          Status: {invoice.status}
          {invoice.issuedAt
            ? ` · Issued ${formatDomainDate(invoice.issuedAt)}`
            : ""}
        </p>
        <table className="w-full text-sm">
          <tbody>
            {invoice.lineItems.map((line) => (
              <tr
                key={line.description}
                className="border-b border-[var(--hb-p-border)]"
              >
                <td className="hb-text py-2">{line.description}</td>
                <td className="hb-text py-2 text-right tabular-nums">
                  {line.lineTotal} {invoice.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="hb-muted">Subtotal</dt>
          <dd className="hb-text text-right tabular-nums">
            {invoice.subtotal} {invoice.currency}
          </dd>
          <dt className="hb-muted">Tax</dt>
          <dd className="hb-text text-right tabular-nums">
            {invoice.tax} {invoice.currency}
          </dd>
          <dt className="hb-text font-bold">Total</dt>
          <dd className="hb-text text-right font-bold tabular-nums">
            {invoice.total} {invoice.currency}
          </dd>
        </dl>
        {invoice.domainOrderPublicId ? (
          <p className="hb-muted text-xs">
            Order{" "}
            <Link
              href={`${routes.accountOrders}/${invoice.domainOrderPublicId}`}
              className="hb-link"
            >
              {invoice.domainOrderPublicId}
            </Link>
          </p>
        ) : null}
        <a
          href={`/api/account/invoices/${invoice.publicId}/pdf`}
          className="hb-btn hb-btn-primary"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
