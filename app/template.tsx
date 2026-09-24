/**
 * Re-mounted on client navigations — subtle enter fade only (no layout shift).
 */
export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hb-route-surface">{children}</div>;
}
