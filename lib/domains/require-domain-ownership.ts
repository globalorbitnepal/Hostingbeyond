import { prisma } from "@/lib/prisma";

export async function requireActiveDomainRegistration(
  userId: string,
  domainInput: string,
) {
  const domain = domainInput.trim().toLowerCase();
  const registration = await prisma.domainRegistration.findFirst({
    where: { userId, domain, status: "ACTIVE" },
  });
  if (!registration) {
    return { ok: false as const, status: 404, error: "Domain not found." };
  }
  return { ok: true as const, registration };
}
