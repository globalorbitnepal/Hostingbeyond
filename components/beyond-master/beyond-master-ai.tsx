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

export function BeyondMasterAiHost({
  hideLauncher = false,
  force = false,
}: {
  hideLauncher?: boolean;
  force?: boolean;
}) {
  useBeyondMasterAi();
  const [mounted, setMounted] = useState(false);
  const [publicChat, setPublicChat] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (force) return;
    void fetch("/api/beyond-master/features", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload: { publicChat?: boolean }) => {
        if (payload.publicChat === false) setPublicChat(false);
      })
      .catch(() => undefined);
  }, [force]);

  if (!mounted || (!publicChat && !force)) return null;

  return (
    <>
      {hideLauncher ? null : <BeyondMasterAiLauncher />}
      <BeyondMasterAiPanel />
    </>
  );
}
