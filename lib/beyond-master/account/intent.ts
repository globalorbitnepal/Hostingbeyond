const PERSONAL = /\b(my|mine|i own|i have|do i have)\b|मेरा|मेरी|मेरो|मेरी/i;

const TOPICS = {
  domain: /domain|domains|expire|expiry|nameserver|nameservers|डोमेन|म्याद/i,
  hosting: /hosting plan|my hosting|hosting service|hosting status|होस्टिङ/i,
  invoice:
    /invoice|invoices|outstanding|payment due|next payment|paid|इनभ्वाइस|बिल/i,
  payment: /payment history|payments|wallet payment/i,
  wallet: /wallet|balance|ब्यालेन्स/i,
  service: /my services|services do i|existing services/i,
} as const;

export type AccountTopic = keyof typeof TOPICS;

export function accountTopics(message: string): AccountTopic[] {
  if (!PERSONAL.test(message)) return [];
  return (Object.keys(TOPICS) as AccountTopic[]).filter((topic) =>
    TOPICS[topic].test(message),
  );
}

export function isAccountQuestion(message: string) {
  return accountTopics(message).length > 0;
}

export function mentionedDomain(message: string) {
  const match = message.match(
    /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24})\b/i,
  );
  return match?.[1]?.toLowerCase() ?? null;
}

export function mentionedInvoice(message: string) {
  const match = message.match(/\b([A-Z]{1,8}-\d{3,})\b/);
  return match?.[1] ?? null;
}

export function accountPage(message: string) {
  const match = message.match(/\bpage\s+([1-5])\b/i);
  const page = match ? Number(match[1]) : 1;
  return page >= 1 && page <= 5 ? page : 1;
}
