import { INTEGRATION_CATALOG } from "@/lib/integrations/catalog";
import type { IntegrationStatus } from "@/lib/integrations/types";

/** Presence/enablement only. Never include secret values. */
export function integrationStatuses(
  env: Record<string, string | undefined> = process.env,
): IntegrationStatus[] {
  return INTEGRATION_CATALOG.map((slot) => {
    const configured = slot.isConfigured(env);
    const enabled = slot.isEnabled ? slot.isEnabled(env) : configured;
    return {
      id: slot.id,
      kind: slot.kind,
      vendor: slot.vendor,
      implemented: slot.implemented,
      configured,
      enabled,
      failClosed: slot.failClosed,
    };
  });
}

export function integrationStatusById(
  id: string,
  env: Record<string, string | undefined> = process.env,
): IntegrationStatus | null {
  return integrationStatuses(env).find((row) => row.id === id) ?? null;
}
