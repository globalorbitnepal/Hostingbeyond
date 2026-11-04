import { prisma } from "@/lib/prisma";

export type AgentHostingPlan = {
  product: string;
  path: string;
  planName: string;
  monthly: string;
  yearly: string;
  currency: string;
  storage: string | null;
  websiteLimit: string | null;
  emailAccounts: string | null;
};

export type AgentTldPrice = {
  tld: string;
  currency: string;
  register: string;
  renew: string;
  transfer: string;
};

const HOSTING_SLUGS = [
  "web-hosting",
  "wordpress-hosting",
  "ecommerce-hosting",
  "business-hosting",
  "nodejs-hosting",
  "python-hosting",
  "laravel-hosting",
  "django-hosting",
  "nestjs-hosting",
  "kvm-vps",
  "nvme-vps",
  "linux-vps",
  "managed-vps",
];

export async function readAgentHostingPlans(
  slugs: string[] = HOSTING_SLUGS,
): Promise<AgentHostingPlan[]> {
  const wanted = slugs.filter((slug) => HOSTING_SLUGS.includes(slug));
  if (wanted.length === 0) return [];
  try {
    const products = await prisma.hostingProduct.findMany({
      where: { slug: { in: wanted }, status: "ACTIVE" },
      orderBy: { displayOrder: "asc" },
      select: {
        slug: true,
        name: true,
        canonicalPath: true,
        plans: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          take: 3,
          select: {
            planName: true,
            monthlyPrice: true,
            yearlyPrice: true,
            currency: true,
            storage: true,
            websites: true,
            emailAccounts: true,
          },
        },
      },
    });
    return products.flatMap((product) =>
      product.plans.map((plan) => ({
        product: product.name,
        path: product.canonicalPath || `/${product.slug}`,
        planName: plan.planName,
        monthly: plan.monthlyPrice.toString(),
        yearly: plan.yearlyPrice.toString(),
        currency: plan.currency,
        storage: plan.storage,
        websiteLimit: plan.websites,
        emailAccounts: plan.emailAccounts,
      })),
    );
  } catch {
    return [];
  }
}

export async function readAgentTldPrices(
  tlds: string[],
): Promise<AgentTldPrice[]> {
  const keys = [
    ...new Set(
      tlds.flatMap((tld) => {
        const bare = tld.replace(/^\./, "").toLowerCase();
        return [bare, `.${bare}`];
      }),
    ),
  ];
  if (keys.length === 0) return [];
  try {
    const rows = await prisma.domainTldPrice.findMany({
      where: { tld: { in: keys }, enabled: true },
      select: {
        tld: true,
        retailCurrency: true,
        retailRegister: true,
        retailRenew: true,
        retailTransfer: true,
      },
    });
    return rows.map((row) => ({
      tld: `.${row.tld.replace(/^\./, "")}`,
      currency: row.retailCurrency,
      register: row.retailRegister.toString(),
      renew: row.retailRenew.toString(),
      transfer: row.retailTransfer.toString(),
    }));
  } catch {
    return [];
  }
}
