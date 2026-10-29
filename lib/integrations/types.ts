export type IntegrationKind =
  | "database"
  | "storage"
  | "registrar"
  | "payments"
  | "oauth"
  | "translation"
  | "mail"
  | "hosting"
  | "orbit";

export type IntegrationImplementation = "live" | "widget" | "stub";

export type IntegrationSlot = {
  readonly id: string;
  readonly kind: IntegrationKind;
  readonly vendor: string;
  readonly summary: string;
  readonly envKeys: readonly string[];
  readonly implemented: IntegrationImplementation;
  readonly failClosed: boolean;
  readonly isConfigured: (env?: Record<string, string | undefined>) => boolean;
  readonly isEnabled?: (env?: Record<string, string | undefined>) => boolean;
};

export type IntegrationStatus = {
  id: string;
  kind: IntegrationKind;
  vendor: string;
  implemented: IntegrationImplementation;
  configured: boolean;
  enabled: boolean;
  failClosed: boolean;
};
