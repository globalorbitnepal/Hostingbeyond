export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function extractTocFromHtml(html: string): TocItem[] {
  const items: TocItem[] = [];
  const re = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = re.exec(html))) {
    const level = Number(match[1]) as 2 | 3;
    const text = match[3].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    const id =
      match[2]?.trim() ||
      `section-${index}-${text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`;
    items.push({ id, text, level });
    index += 1;
  }
  return items;
}

export function injectHeadingIds(html: string, toc: TocItem[]): string {
  if (!toc.length) return html;
  let i = 0;
  return html.replace(
    /<h([23])([^>]*)>(.*?)<\/h[23]>/gi,
    (full, level, attrs, inner) => {
      const item = toc[i];
      i += 1;
      if (!item) return full;
      if (/id=/.test(attrs)) return full;
      return `<h${level}${attrs} id="${item.id}">${inner}</h${level}>`;
    },
  );
}
