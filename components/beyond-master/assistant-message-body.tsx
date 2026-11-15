import Link from "next/link";
import type { ReactNode } from "react";

const TOKEN =
  /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s<]+)|\B(\/[a-z0-9][a-z0-9\-/_]*(?:\?[^\s<]*)?)/gi;

function cleanHref(raw: string) {
  return raw.replace(/[),.;:]+$/g, "");
}

function isSafeHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function MessageLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const safe = cleanHref(href);
  if (!isSafeHref(safe)) return <>{children}</>;
  if (safe.startsWith("/")) {
    return (
      <Link href={safe} className="hb-bmai-link">
        {children}
      </Link>
    );
  }
  return (
    <a
      href={safe}
      className="hb-bmai-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

export function AssistantMessageBody({ body }: { body: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of body.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(body.slice(last, index));
    const [full, label, href, bold, url, path] = match;
    if (label && href) {
      nodes.push(
        <MessageLink key={`${index}-md`} href={href}>
          {label}
        </MessageLink>,
      );
    } else if (bold) {
      nodes.push(<strong key={`${index}-b`}>{bold}</strong>);
    } else if (url || path) {
      const raw = url || path;
      nodes.push(
        <MessageLink key={`${index}-u`} href={raw}>
          {cleanHref(raw)}
        </MessageLink>,
      );
      const trailing = raw.slice(cleanHref(raw).length);
      if (trailing) nodes.push(trailing);
    } else {
      nodes.push(full);
    }
    last = index + full.length;
  }
  if (last < body.length) nodes.push(body.slice(last));
  return <p>{nodes}</p>;
}
