import { prisma } from "@/lib/prisma";

export async function customerFirstName(
  customerUserId: string | null,
): Promise<string | null> {
  if (!customerUserId) return null;
  try {
    const row = await prisma.customerUser.findUnique({
      where: { id: customerUserId },
      select: { name: true },
    });
    const first = row?.name?.trim().split(/\s+/)[0] ?? "";
    if (!first || first.length > 40) return null;
    return first;
  } catch {
    return null;
  }
}
