import {
  postCommerceCancel,
  postCommerceConfirm,
} from "@/lib/beyond-master/commerce/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return postCommerceConfirm(request);
}
