import {
  MAX_ATTACHMENT_BYTES,
  addThreadAttachments,
} from "@/lib/beyond-master/history/store";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerJwt,
} from "@/lib/customer/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await context.params;
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_ATTACHMENT_BYTES * 6) {
    return Response.json(
      { error: "Upload is larger than 5 MB." },
      { status: 413 },
    );
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { error: "Upload could not be read." },
      { status: 400 },
    );
  }
  const title = String(form.get("title") ?? "New conversation");
  const files: { fileName: string; contentType: string; data: Buffer }[] = [];
  for (const entry of form.getAll("files")) {
    if (!(entry instanceof File)) continue;
    if (entry.size > MAX_ATTACHMENT_BYTES) {
      return Response.json(
        { error: `${entry.name} is larger than 5 MB.` },
        { status: 413 },
      );
    }
    files.push({
      fileName: entry.name,
      contentType: entry.type || "application/octet-stream",
      data: Buffer.from(await entry.arrayBuffer()),
    });
  }
  const verified = await verifyCustomerJwt(
    cookieValue(request, CUSTOMER_SESSION_COOKIE),
  );
  const result = await addThreadAttachments({
    threadId,
    customerUserId: verified?.customerUserId ?? null,
    title,
    files,
  });
  if (result.saved === 0) {
    return Response.json(
      { error: result.errors[0] ?? "Upload was rejected." },
      { status: 400 },
    );
  }
  return Response.json(result);
}
