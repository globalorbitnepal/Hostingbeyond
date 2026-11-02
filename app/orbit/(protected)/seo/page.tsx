import { redirect } from "next/navigation";

/**
 * The standalone bulk SEO screen duplicated Orbit → Pages, which edits the
 * exact same `PageContent.seo` rows per page. Two editors writing one record is
 * how conflicting metadata appears, so this route now forwards to the single
 * canonical editor.
 */
export default function OrbitSeoRedirectPage() {
  redirect("/orbit/pages");
}
