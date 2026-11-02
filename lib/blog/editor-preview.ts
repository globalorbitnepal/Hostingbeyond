/**
 * Lightweight, dependency-free HTML allowlist for the Orbit editor preview.
 *
 * The authoritative sanitizer for stored content is `sanitizeBlogHtml`
 * (sanitize-html, server only). That package is Node-only, so the browser
 * preview uses this pure-string equivalent. It must never be used to persist
 * content — the write path always re-sanitizes server-side.
 */

const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "div",
  "span",
  "iframe",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  iframe: new Set(["src", "title", "allow", "allowfullscreen", "loading"]),
  div: new Set(["class", "data-callout", "data-hb-cta"]),
  span: new Set(["class"]),
  code: new Set(["class"]),
  pre: new Set(["class"]),
  th: new Set(["colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
};

const DROPPED_BLOCKS =
  /<(script|style|object|embed|link|meta|form|input|button)[\s\S]*?<\/\1>/gi;

const YOUTUBE_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
];

function isSafeHref(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeImageSrc(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isYouTubeSrc(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return false;
    return YOUTUBE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function safeEditorPreviewHtml(html: string): string {
  if (!html) return "";
  const withoutBlocks = html.replace(DROPPED_BLOCKS, "");

  return withoutBlocks.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^<>]*?)?)\/?>/g,
    (match, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (match.startsWith("</")) return `</${tag}>`;

      const allowed = ALLOWED_ATTRS[tag];
      const kept: string[] = [];

      if (allowed) {
        const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
        let attr: RegExpExecArray | null;
        while ((attr = attrRe.exec(rawAttrs))) {
          const name = attr[1].toLowerCase();
          const value = attr[2];
          if (!allowed.has(name)) continue;

          if (name === "href" && !isSafeHref(value)) continue;
          if (name === "src") {
            if (tag === "iframe") {
              if (!isYouTubeSrc(value)) continue;
            } else if (!isSafeImageSrc(value)) {
              continue;
            }
          }
          if (name === "class" && !/^[\w\s-]*$/.test(value)) continue;
          kept.push(`${name}="${escapeAttribute(value)}"`);
        }
      }

      if (tag === "a" && kept.some((a) => a.startsWith('target="_blank"'))) {
        if (!kept.some((a) => a.startsWith("rel="))) {
          kept.push('rel="noopener noreferrer"');
        }
      }

      const selfClosing = tag === "br" || tag === "hr" || tag === "img";
      return `<${tag}${kept.length ? ` ${kept.join(" ")}` : ""}${selfClosing ? " /" : ""}>`;
    },
  );
}
