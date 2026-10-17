import { issueInvoiceForDomainOrder } from "@/lib/billing/invoice-builder";

/** Fire-and-forget safe wrapper — never throws to checkout callers. */
export async function tryIssueInvoiceForDomainOrder(
  domainOrderId: string,
): Promise<void> {
  try {
    const result = await issueInvoiceForDomainOrder(domainOrderId);
    if (!result.ok) {
      console.warn(
        `invoice_issue_skipped order=${domainOrderId} reason=${result.reason}`,
      );
    }
  } catch (error) {
    console.error(
      `invoice_issue_failed order=${domainOrderId}`,
      error instanceof Error ? error.message : error,
    );
  }
}
