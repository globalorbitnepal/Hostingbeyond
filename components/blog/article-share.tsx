"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

import { blogPostPath } from "@/lib/blog/paths";
import { siteConfig } from "@/config/site";

export function ArticleShare({
  title,
  slug,
  className = "",
}: {
  title: string;
  slug: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = new URL(blogPostPath(slug), siteConfig.url).toString();
  const enc = encodeURIComponent;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(`${title} ${url}`)}`,
    },
  ];

  return (
    <div className={className}>
      <p className="text-sm font-semibold text-slate-700">Share</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {links.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-violet-200"
          >
            {item.label}
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-violet-200"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Link2 className="size-3.5" />
          )}
          Copy link
        </button>
      </div>
    </div>
  );
}
