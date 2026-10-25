/**
 * Re-mounted on client navigations — opacity fade only (no transform; keeps header stable).
 */
export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hb-route-surface">{children}</div>;
}
