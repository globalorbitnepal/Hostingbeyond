import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BeyondAiWorkspace } from "@/components/beyond-ai/beyond-ai-workspace";
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

export const metadata = {
  title: "Beyond AI Workspace",
  robots: { index: false },
};

export default async function BeyondAiWorkspacePage() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/beyond-ai/workspace")}`);
  }

  return <BeyondAiWorkspace email={user.email} />;
}
