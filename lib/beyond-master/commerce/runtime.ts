import { prismaCommerceStore } from "@/lib/beyond-master/commerce/prisma-store";
import type { CommerceStore } from "@/lib/beyond-master/commerce/store";

let storeOverride: CommerceStore | null = null;

export function setBeyondMasterCommerceRuntimeForTests(
  store: CommerceStore | null,
) {
  if (process.env.NODE_ENV === "production") return;
  storeOverride = store;
}

export function beyondMasterCommerceRuntime(): { store: CommerceStore } {
  return {
    store: storeOverride ?? prismaCommerceStore(),
  };
}
