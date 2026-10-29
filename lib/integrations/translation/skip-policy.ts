/**
 * Strings the Cloud Translation API must not rewrite.
 * Prices, domains, TLDs, and product identifiers stay in source form.
 */
export function shouldSkipCloudTranslation(text: string): boolean {
  const t = text.trim();
  if (t.length < 2) return true;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(t)) return true;
  if (/^\/[\w./?=&%-]+$/.test(t)) return true;
  if (/^\.[a-z0-9-]+$/i.test(t)) return true;
  if (/^[\w-]+\.[a-z]{2,}(?:\.[a-z]{2,})?$/i.test(t) && !t.includes(" ")) {
    return true;
  }
  if (/^[\d$€£¥₹.,\s/%+-]+$/.test(t)) return true;
  if (/\$\s?\d/.test(t) && /(\/|\b)(yr|mo|year|month|yr\b)/i.test(t)) {
    return true;
  }
  if (
    t.length < 48 &&
    /\b(USD|EUR|GBP|NPR|INR|AUD|CAD|JPY|BRL|BDT|CNY|RUB)\b/.test(t) &&
    /\d/.test(t)
  ) {
    return true;
  }
  if (/^[A-Z]{2,5}-[A-Z0-9-]{2,}$/.test(t)) return true;
  if (/^HB[A-Z0-9-]{3,}$/i.test(t)) return true;
  return false;
}
