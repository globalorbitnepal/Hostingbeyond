import { siteConfig } from "@/config/site";
import { blogPostPath } from "@/lib/blog/paths";
import { listPublishedPosts } from "@/lib/blog/queries";

export const runtime = "nodejs";

export async function GET() {
  const { posts } = await listPublishedPosts({ page: 1 });
  const items = posts
    .map((post) => {
      const url = new URL(blogPostPath(post.slug), siteConfig.url).toString();
      const author =
        post.author?.displayName || post.author?.name || "HostingBeyond";
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${url}</link>
  <guid>${url}</guid>
  <description>${escapeXml(post.excerpt)}</description>
  <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : ""}</pubDate>
  <author>${escapeXml(author)}</author>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(siteConfig.name)} Blog</title>
  <link>${new URL("/resources/blog", siteConfig.url).toString()}</link>
  <description>HostingBeyond blog — hosting, domains, and website guides.</description>
  ${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
