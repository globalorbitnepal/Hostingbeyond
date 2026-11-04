"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useBeyondMasterAi } from "@/lib/beyond-master/ui-store";

import { BeyondMasterAiLauncher } from "./beyond-master-launcher";

const BeyondMasterAiPanel = dynamic(
  () => import("./beyond-master-panel").then((mod) => mod.BeyondMasterAiPanel),
  { ssr: false },
);

export { BeyondMasterAiLauncher };

export function BeyondMasterAiHost() {
  const { open } = useBeyondMasterAi();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;
  return <BeyondMasterAiPanel />;
}
