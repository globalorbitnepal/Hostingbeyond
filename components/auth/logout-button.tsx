"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="hb-text-soft flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold hover:bg-[var(--hb-p-primary)]/10"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      Log out
    </button>
  );
}
