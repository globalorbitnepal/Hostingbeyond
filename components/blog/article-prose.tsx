export function ArticleProse({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`hb-blog-prose text-[17px] leading-[1.75] text-slate-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
