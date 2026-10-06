import "dotenv/config";

import { lookupDomainNames } from "@/lib/domains/lookup";

async function check(label: string, query: string) {
  const normalized = query.includes(".") ? query : `${query}.com`;
  const { results, source } = await lookupDomainNames([normalized], {
    query: normalized,
  });
  const row = results.find((r) => r.domain === normalized) ?? results[0];
  console.log(
    JSON.stringify({
      label,
      source,
      domain: row?.domain,
      status: row?.status,
      register: row?.register,
    }),
  );
}

async function main() {
  await check("google", "google.com");
  await new Promise((r) => setTimeout(r, 800));
  await check("namecheap", "namecheap.com");
  await new Promise((r) => setTimeout(r, 800));
  const availableLabel = `hbsearch-${Date.now().toString(36)}.com`;
  await check("available_probe", availableLabel);
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
});
