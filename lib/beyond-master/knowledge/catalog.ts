export type HostingCatalogPlan = {
  planName: string;
  currency: string;
  monthlyPrice: string;
  yearlyPrice: string;
  storage: string | null;
  bandwidth: string | null;
  websites: string | null;
  databases: string | null;
  emailAccounts: string | null;
  ssl: string | null;
  backup: string | null;
};

export type HostingCatalogProduct = {
  slug: string;
  name: string;
  path: string;
  plans: HostingCatalogPlan[];
};

export type DomainCatalogPrice = {
  tld: string;
  currency: string;
  register: string;
  renew: string;
  transfer: string;
};

const HOSTING_SLUGS: Record<string, string[]> = {
  shared: [
    "web-hosting",
    "wordpress-hosting",
    "ecommerce-hosting",
    "business-hosting",
  ],
  developer: [
    "nodejs-hosting",
    "python-hosting",
    "laravel-hosting",
    "django-hosting",
    "nestjs-hosting",
  ],
  vps: ["kvm-vps", "nvme-vps", "linux-vps", "managed-vps"],
  node: ["nodejs-hosting"],
};

export function catalogIntent(question: string): {
  hostingSlugs: string[];
  tlds: string[];
} {
  const text = question.toLowerCase();
  const asksAmount =
    /price|prices|cost|how much|plan|plans|compare|storage|spec|कीमत|मूल्य|कति|दाम/.test(
      text,
    );
  if (!asksAmount) return { hostingSlugs: [], tlds: [] };
  const slugs = new Set<string>();
  if (
    /shared|web hosting|wordpress|ecommerce|cloud hosting|business hosting/.test(
      text,
    )
  ) {
    HOSTING_SLUGS.shared.forEach((slug) => slugs.add(slug));
  }
  if (/developer|python|laravel|django|nestjs/.test(text)) {
    HOSTING_SLUGS.developer.forEach((slug) => slugs.add(slug));
  }
  if (/vps|kvm|nvme|virtual server/.test(text)) {
    HOSTING_SLUGS.vps.forEach((slug) => slugs.add(slug));
  }
  if (/node\.?js|nodejs|नोड/.test(text)) {
    HOSTING_SLUGS.node.forEach((slug) => slugs.add(slug));
  }
  const allowed = new Set([
    "com",
    "net",
    "org",
    "io",
    "co",
    "in",
    "np",
    "dev",
    "app",
    "shop",
  ]);
  const mentioned = [...text.matchAll(/\.([a-z0-9]{2,12})\b/g)]
    .map((match) => match[1])
    .filter((token) => allowed.has(token));
  const tlds =
    mentioned.length > 0 || /domain|tld|extension|डोमेन/.test(text)
      ? mentioned
      : [];
  return { hostingSlugs: [...slugs], tlds: [...new Set(tlds)].slice(0, 4) };
}

export function formatHostingCatalog(
  products: HostingCatalogProduct[],
): string {
  if (products.length === 0) {
    return "Live hosting catalog returned no active plan rows for this question. Do not invent prices or specifications.";
  }
  const lines = [
    "Live hosting catalog. Quote only these fields. Leave a blank field unstated.",
  ];
  for (const product of products.slice(0, 6)) {
    lines.push(`${product.name} (${product.slug}) ${product.path}`);
    for (const plan of product.plans.slice(0, 8)) {
      lines.push(
        [
          plan.planName,
          `${plan.monthlyPrice} ${plan.currency}/month`,
          `${plan.yearlyPrice} ${plan.currency}/year`,
          field("storage", plan.storage),
          field("bandwidth", plan.bandwidth),
          field("websites", plan.websites),
          field("databases", plan.databases),
          field("email", plan.emailAccounts),
          field("ssl", plan.ssl),
          field("backup", plan.backup),
        ]
          .filter(Boolean)
          .join("; "),
      );
    }
  }
  return lines.join("\n").slice(0, 3500);
}

export function formatDomainCatalog(prices: DomainCatalogPrice[]): string {
  if (prices.length === 0) {
    return "Live domain catalog has no matching enabled extension. Do not invent a register, renew, or transfer price.";
  }
  const lines = [
    "Live domain retail catalog for the named extension. Supplier cost is omitted.",
  ];
  for (const price of prices.slice(0, 4)) {
    lines.push(
      `.${price.tld.replace(/^\./, "")}: register ${price.register} ${price.currency}, renew ${price.renew} ${price.currency}, transfer ${price.transfer} ${price.currency}`,
    );
  }
  return lines.join("\n");
}

function field(label: string, value: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? `${label} ${trimmed}` : "";
}
