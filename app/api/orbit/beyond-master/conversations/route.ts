import {
  deleteChatThread,
  listChatThreads,
  readChatAttachment,
  readChatThread,
} from "@/lib/beyond-master/history/store";
import {
  forbiddenJson,
  requireOrbitBeyondMasterSupport,
  unauthorizedJson,
} from "@/lib/orbit/api";
import { isOrbitFullAdmin } from "@/lib/orbit/staff-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireOrbitBeyondMasterSupport();
  if (!admin) return unauthorizedJson();
  const scope = isOrbitFullAdmin(admin.id)
    ? undefined
    : ({ supportStaffId: admin.id } as const);
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const thread = await readChatThread(id, scope);
    if (!thread) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ thread });
  }
  const fileId = url.searchParams.get("attachment");
  const threadId = url.searchParams.get("thread");
  if (fileId && threadId) {
    const file = await readChatAttachment(threadId, fileId, scope);
    if (!file) return Response.json({ error: "Not found." }, { status: 404 });
    return new Response(new Uint8Array(file.data), {
      headers: {
        "content-type": file.contentType,
        "content-disposition": `inline; filename="${encodeURIComponent(file.fileName)}"`,
        "cache-control": "private, no-store",
      },
    });
  }
  const threads = await listChatThreads({
    query: url.searchParams.get("q") ?? undefined,
    ...(isOrbitFullAdmin(admin.id) ? {} : { supportStaffId: admin.id }),
  });
  return Response.json({ threads });
}

export async function DELETE(request: Request) {
  const admin = await requireOrbitBeyondMasterSupport();
  if (!admin) return unauthorizedJson();
  if (!isOrbitFullAdmin(admin.id)) return forbiddenJson();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });
  const removed = await deleteChatThread(id);
  if (!removed) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({ removed: true });
}
