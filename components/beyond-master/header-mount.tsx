"use client";

import { beyondMasterHeaderVisibility } from "@/lib/beyond-master/header-slots";

import { BeyondMasterAiHost, BeyondMasterAiLauncher } from "./beyond-master-ai";

export function BeyondMasterHeaderLauncher({
  checkout,
  compact = false,
  menu = false,
  onOpen,
}: {
  checkout: boolean;
  compact?: boolean;
  menu?: boolean;
  onOpen?: () => void;
}) {
  if (!beyondMasterHeaderVisibility(checkout).launcher) return null;
  return (
    <BeyondMasterAiLauncher compact={compact} menu={menu} onOpen={onOpen} />
  );
}

export function BeyondMasterHeaderHost({ checkout }: { checkout: boolean }) {
  if (!beyondMasterHeaderVisibility(checkout).panel) return null;
  return <BeyondMasterAiHost />;
}
