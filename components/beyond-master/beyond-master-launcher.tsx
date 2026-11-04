"use client";

import { BEYOND_MASTER_NAME } from "@/lib/beyond-master/copy";
import {
  openBeyondMasterAi,
  useBeyondMasterAi,
} from "@/lib/beyond-master/ui-store";

import { BeyondMasterIcon } from "./beyond-master-icon";

export function BeyondMasterAiLauncher({
  compact = false,
  menu = false,
  onOpen,
}: {
  compact?: boolean;
  menu?: boolean;
  onOpen?: () => void;
}) {
  const { open } = useBeyondMasterAi();
  const openPanel = () => {
    openBeyondMasterAi();
    onOpen?.();
  };

  if (menu) {
    return (
      <button
        type="button"
        className="mb-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-3 text-[13px] font-bold tracking-[0.04em] text-white sm:hidden"
        aria-expanded={open}
        aria-controls="beyond-master-ai-panel"
        onClick={openPanel}
      >
        <BeyondMasterIcon size={16} />
        {BEYOND_MASTER_NAME}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={
        compact
          ? "hidden size-9 touch-manipulation items-center justify-center rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white shadow-[0_6px_16px_rgba(79,70,229,0.28)] transition-transform duration-150 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67e8f9] sm:inline-flex sm:size-10"
          : "inline-flex h-9 max-w-[148px] touch-manipulation items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-2.5 text-[10px] font-bold tracking-[0.04em] text-white shadow-[0_6px_16px_rgba(79,70,229,0.28)] transition-transform duration-150 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67e8f9] xl:h-10 xl:max-w-none xl:px-3 xl:text-[11px]"
      }
      aria-expanded={open}
      aria-controls="beyond-master-ai-panel"
      aria-label={BEYOND_MASTER_NAME}
      onClick={openPanel}
    >
      <BeyondMasterIcon size={compact ? 16 : 15} />
      {compact ? null : <span className="truncate">{BEYOND_MASTER_NAME}</span>}
    </button>
  );
}
