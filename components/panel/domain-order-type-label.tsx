export function domainOrderTypeLabel(orderType: string): string {
  switch (orderType) {
    case "register":
      return "Registration";
    case "renew":
      return "Renewal";
    case "transfer":
      return "Transfer";
    default:
      return orderType;
  }
}

export function domainOrderStatusLabel(status: string): string {
  switch (status) {
    case "REGISTERED":
      return "Completed";
    case "FAILED":
      return "Failed";
    case "RECONCILIATION_REQUIRED":
      return "Pending verification";
    case "PROCESSING":
    case "REGISTERING":
      return "In progress";
    case "PENDING_PAYMENT":
      return "Awaiting payment";
    case "CANCELLED":
      return "Cancelled";
    case "REFUNDED":
    case "REFUND_PENDING":
      return "Refunded";
    default:
      return status.replaceAll("_", " ").toLowerCase();
  }
}
