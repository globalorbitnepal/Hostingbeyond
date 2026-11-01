"use client";

import { cn } from "@/lib/utils";

/**
 * Settlement / display currency disclaimer — must not be rewritten by Cloud
 * Translation or the Google Website Translator widget.
 */
export function CheckoutNote({
  text,
  className,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "span";
}) {
  return (
    <Tag
      className={cn("notranslate", className)}
      translate="no"
      data-hb-no-translate
    >
      {text}
    </Tag>
  );
}
