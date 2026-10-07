import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "h2",
  "h3",
  "h4",
  "p",
  "br",
  "strong",
  "em",
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
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  iframe: ["src", "title", "allow", "allowfullscreen", "loading"],
  div: ["class", "data-callout"],
  span: ["class"],
  code: ["class"],
  pre: ["class"],
  th: ["colspan", "rowspan"],
  td: ["colspan", "rowspan"],
};

function safeUrl(href: string) {
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
      iframe: ["https"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        if (!safeUrl(href)) {
          delete attribs.href;
        }
        if (attribs.target === "_blank") {
          attribs.rel = "noopener noreferrer";
        }
        return { tagName, attribs };
      },
      iframe: (tagName, attribs) => {
        const src = attribs.src ?? "";
        if (
          !src.includes("youtube.com") &&
          !src.includes("youtube-nocookie.com") &&
          !src.includes("youtu.be")
        ) {
          return { tagName: "div", attribs: {}, text: "" };
        }
        return { tagName, attribs };
      },
    },
  });
}
