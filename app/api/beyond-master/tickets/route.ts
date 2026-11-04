import {
  getCustomerTickets,
  postTicketSubmit,
} from "@/lib/beyond-master/tickets/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return getCustomerTickets(request);
}

export function POST(request: Request) {
  return postTicketSubmit(request);
}
