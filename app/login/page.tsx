import type { Metadata } from "next";

import { LoginPageView } from "@/components/auth/login-page";
import { getLoginPage } from "@/lib/orbit/content";

export const metadata: Metadata = {
  title: "Login — HostingBeyond",
  description: "Sign in to manage your HostingBeyond hosting services.",
};

export default async function LoginPage() {
  const content = await getLoginPage();
  return <LoginPageView content={content} />;
}
