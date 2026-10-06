import { validateDomainForRegistration } from "@/lib/domains/validate-registration";
import { splitDomain } from "@/lib/domains/tlds";
import { prisma } from "@/lib/prisma";

const MAX_ITEMS = 50;

export type CartLine = {
  id: string;
  domain: string;
  tld: string;
  periodYears: number;
  status: string;
  register: number;
  renew: number;
  currency: string;
};

export type CartSnapshot = {
  items: CartLine[];
  count: number;
  total: number;
  currency: string;
};

export type RevalidateCartResult = {
  ok: true;
  items: CartLine[];
  rejected: string[];
  priceChanges: Array<{ domain: string; previous: number; current: number }>;
  requiresConfirmation: boolean;
};

async function getOrCreateCart(userId: string) {
  return prisma.domainCart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { items: true },
  });
}

export async function getDomainCartForUser(
  userId: string,
): Promise<CartSnapshot> {
  const cart = await prisma.domainCart.findUnique({
    where: { userId },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (!cart) {
    return { items: [], count: 0, total: 0, currency: "USD" };
  }
  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.register),
    0,
  );
  return {
    items: cart.items.map((item) => ({
      id: item.id,
      domain: item.domain,
      tld: item.tld,
      periodYears: item.periodYears,
      status: item.status,
      register: Number(item.register),
      renew: Number(item.renew),
      currency: item.currency,
    })),
    count: cart.items.length,
    total: Math.round(total * 100) / 100,
    currency: "USD",
  };
}

export async function addDomainToCart(userId: string, domainInput: string) {
  const validated = await validateDomainForRegistration(domainInput);
  if (!validated.ok) {
    return {
      ok: false as const,
      error: validated.error,
      status: validated.status,
    };
  }
  const { result } = validated;
  if (result.status !== "available" && result.status !== "premium") {
    return {
      ok: false as const,
      error: "That domain is not available to register.",
      status: 409,
    };
  }
  if (result.register == null) {
    return {
      ok: false as const,
      error: "Pricing is unavailable for this extension.",
      status: 400,
    };
  }

  const cart = await getOrCreateCart(userId);
  if (
    cart.items.length >= MAX_ITEMS &&
    !cart.items.some((i) => i.domain === result.domain)
  ) {
    return {
      ok: false as const,
      error: `Cart is limited to ${MAX_ITEMS} domains.`,
      status: 400,
    };
  }

  const { tld } = splitDomain(result.domain);
  await prisma.domainCartItem.upsert({
    where: {
      cartId_domain: { cartId: cart.id, domain: result.domain },
    },
    create: {
      cartId: cart.id,
      domain: result.domain,
      tld: tld || ".com",
      periodYears: 1,
      status: result.status,
      register: result.register,
      renew: result.renew ?? 0,
      currency: "USD",
    },
    update: {
      status: result.status,
      register: result.register,
      renew: result.renew ?? 0,
    },
  });

  return { ok: true as const, cart: await getDomainCartForUser(userId) };
}

export async function addDomainsToCart(userId: string, domains: string[]) {
  const added: string[] = [];
  const rejected: Array<{ domain: string; error: string }> = [];
  for (const raw of domains) {
    const domain = raw.trim().toLowerCase();
    if (!domain) continue;
    const result = await addDomainToCart(userId, domain);
    if (result.ok) added.push(domain);
    else rejected.push({ domain, error: result.error });
  }
  const cart = await getDomainCartForUser(userId);
  return { cart, added, rejected };
}

/** Merge legacy URL query domains into server cart after login. */
export async function mergeUrlDomainsIntoCart(
  userId: string,
  domains: string[],
) {
  return addDomainsToCart(userId, domains);
}

export async function removeDomainFromCart(userId: string, domain: string) {
  const cart = await prisma.domainCart.findUnique({ where: { userId } });
  if (!cart)
    return { ok: true as const, cart: await getDomainCartForUser(userId) };
  await prisma.domainCartItem.deleteMany({
    where: { cartId: cart.id, domain: domain.trim().toLowerCase() },
  });
  return { ok: true as const, cart: await getDomainCartForUser(userId) };
}

export async function clearDomainCart(userId: string) {
  const cart = await prisma.domainCart.findUnique({ where: { userId } });
  if (!cart) return { ok: true as const };
  await prisma.domainCartItem.deleteMany({ where: { cartId: cart.id } });
  return { ok: true as const };
}

export async function removeRegisteredDomainsFromCart(
  userId: string,
  domains: string[],
) {
  for (const domain of domains) {
    await removeDomainFromCart(userId, domain);
  }
}

/** Revalidate every cart line before checkout — server is source of truth. */
export async function revalidateDomainCart(
  userId: string,
): Promise<RevalidateCartResult> {
  const cart = await prisma.domainCart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!cart || !cart.items.length) {
    return {
      ok: true,
      items: [],
      rejected: [],
      priceChanges: [],
      requiresConfirmation: false,
    };
  }

  const rejected: string[] = [];
  const priceChanges: Array<{
    domain: string;
    previous: number;
    current: number;
  }> = [];

  for (const line of cart.items) {
    const validated = await validateDomainForRegistration(line.domain);
    if (
      !validated.ok ||
      (validated.ok &&
        validated.result.status !== "available" &&
        validated.result.status !== "premium")
    ) {
      rejected.push(line.domain);
      await prisma.domainCartItem.delete({ where: { id: line.id } });
      continue;
    }
    if (validated.ok && validated.result.register != null) {
      const previous = Number(line.register);
      const current = validated.result.register;
      if (Math.abs(previous - current) > 0.001) {
        priceChanges.push({ domain: line.domain, previous, current });
      }
      await prisma.domainCartItem.update({
        where: { id: line.id },
        data: {
          status: validated.result.status,
          register: current,
          renew: validated.result.renew ?? 0,
        },
      });
    }
  }

  const refreshed = await getDomainCartForUser(userId);
  return {
    ok: true,
    items: refreshed.items,
    rejected,
    priceChanges,
    requiresConfirmation: priceChanges.length > 0,
  };
}

export async function loadCheckoutCart(userId: string) {
  const revalidated = await revalidateDomainCart(userId);
  const snapshot = await getDomainCartForUser(userId);
  return { ...revalidated, snapshot };
}
