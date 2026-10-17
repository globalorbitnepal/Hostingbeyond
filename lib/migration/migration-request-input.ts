import { z } from "zod";

/** Public migration intake — rejects client-supplied ownership fields. */
export const migrationRequestBodySchema = z
  .object({
    customerName: z.string().min(2).max(120),
    customerEmail: z.string().email().max(200),
    customerPhone: z.string().max(40).optional(),
    websiteUrl: z.string().max(500).optional(),
    currentProvider: z.string().max(120).optional(),
    domain: z.string().max(253).optional(),
    websiteType: z.string().max(80).optional(),
    emailAccountsCount: z.coerce.number().int().min(0).max(999).optional(),
    websiteSize: z.string().max(80).optional(),
    databaseRequired: z.boolean().optional(),
    preferredDate: z.string().optional(),
    notes: z.string().max(4000).optional(),
  })
  .strict();

export type MigrationRequestBody = z.infer<typeof migrationRequestBodySchema>;

export type NormalizedMigrationRequest = {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  websiteUrl: string | null;
  currentProvider: string | null;
  domain: string | null;
  websiteType: string | null;
  emailAccountsCount: number | null;
  websiteSize: string | null;
  databaseRequired: boolean;
  preferredDate: Date | null;
  notes: string | null;
};

export function normalizeMigrationRequestBody(
  data: MigrationRequestBody,
): NormalizedMigrationRequest {
  const preferredDate = data.preferredDate
    ? new Date(data.preferredDate)
    : null;

  return {
    customerName: data.customerName.trim(),
    customerEmail: data.customerEmail.trim().toLowerCase(),
    customerPhone: data.customerPhone?.trim() || null,
    websiteUrl:
      data.websiteUrl?.trim() && data.websiteUrl.includes(".")
        ? data.websiteUrl.trim()
        : null,
    currentProvider: data.currentProvider?.trim() || null,
    domain: data.domain?.trim().toLowerCase() || null,
    websiteType: data.websiteType?.trim() || null,
    emailAccountsCount: data.emailAccountsCount ?? null,
    websiteSize: data.websiteSize?.trim() || null,
    databaseRequired: data.databaseRequired ?? false,
    preferredDate:
      preferredDate && !Number.isNaN(preferredDate.getTime())
        ? preferredDate
        : null,
    notes: data.notes?.trim() || null,
  };
}

/** Session email wins when authenticated — never trust body email for account linkage. */
export function resolveMigrationCustomerEmail(
  sessionEmail: string | null,
  bodyEmail: string,
): string {
  if (sessionEmail) {
    return sessionEmail.trim().toLowerCase();
  }
  return bodyEmail.trim().toLowerCase();
}
