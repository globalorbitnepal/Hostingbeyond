import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";

import { sanitizeBlogHtml } from "./sanitize";
import { seedBlogTaxonomyIfEmpty } from "./queries";

/** Development-only draft sample — never auto-published. */
export async function seedDevBlogDraftIfEmpty() {
  if (process.env.NODE_ENV === "production") return;
  await seedBlogTaxonomyIfEmpty();

  const existing = await prisma.blogPost.count();
  if (existing > 0) return;

  const category = await prisma.blogCategory.findFirst({
    where: { slug: "hosting" },
  });
  const author = await prisma.blogAuthor.findFirst();
  const authorId =
    author?.id ??
    (
      await prisma.blogAuthor.create({
        data: {
          name: "HostingBeyond Team",
          displayName: "HostingBeyond Team",
          role: "Editorial",
          bio: "Practical hosting and domain guidance from the HostingBeyond team.",
        },
      })
    ).id;

  const content = sanitizeBlogHtml(`
    <h2>Why hosting choice matters</h2>
    <p>Your hosting stack affects speed, security, and how easily you can grow.</p>
    <h3>Start with realistic traffic</h3>
    <p>Match plan resources to real usage — you can scale as visitors increase.</p>
  `);

  await prisma.blogPost.create({
    data: {
      title: "How to Choose the Right Web Hosting for Your Business",
      slug: "how-to-choose-right-web-hosting-business",
      excerpt:
        "A practical checklist for picking hosting that fits your traffic, budget, and growth plans.",
      contentHtml: content,
      status: "DRAFT",
      categoryId: category?.id,
      authorId,
      seoTitle: "How to Choose Web Hosting for Your Business",
      seoDescription:
        "Learn how to evaluate speed, support, security, and pricing when choosing web hosting for a small business website.",
      focusKeyword: "web hosting for small business",
      readingTimeMinutes: 5,
      previewToken: randomBytes(24).toString("hex"),
    },
  });
}
