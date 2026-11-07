import { isTruthyEnvFlag } from "@/lib/config/env-flags";

/**
 * Release gate for consequential Beyond Master operations.
 *
 * The limited support-assistant release ships chat, grounded answers, guest
 * persistence, customer identity, and human handoff. Purchases, registrations,
 * DNS writes, nameserver changes, and provisioning stay OFF until each provider
 * integration is independently verified.
 *
 * Default is DISABLED (fail closed). Two independent switches are required:
 * the global commerce gate plus the specific capability gate, so a single
 * accidental env var cannot enable spending money.
 */
export function beyondMasterCommerceEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return isTruthyEnvFlag(env.BEYOND_MASTER_COMMERCE_ENABLED);
}

export type BeyondMasterCapability =
  | "domain_register"
  | "domain_transfer"
  | "domain_renew"
  | "dns_write"
  | "nameserver_update"
  | "hosting_checkout"
  | "email_provision"
  | "wallet_topup";

const CAPABILITY_ENV: Record<BeyondMasterCapability, string> = {
  domain_register: "BEYOND_MASTER_ALLOW_DOMAIN_REGISTER",
  domain_transfer: "BEYOND_MASTER_ALLOW_DOMAIN_TRANSFER",
  domain_renew: "BEYOND_MASTER_ALLOW_DOMAIN_RENEW",
  dns_write: "BEYOND_MASTER_ALLOW_DNS_WRITE",
  nameserver_update: "BEYOND_MASTER_ALLOW_NAMESERVER_UPDATE",
  hosting_checkout: "BEYOND_MASTER_ALLOW_HOSTING_CHECKOUT",
  email_provision: "BEYOND_MASTER_ALLOW_EMAIL_PROVISION",
  wallet_topup: "BEYOND_MASTER_ALLOW_WALLET_TOPUP",
};

export function capabilityEnvName(capability: BeyondMasterCapability): string {
  return CAPABILITY_ENV[capability];
}

/** A capability runs only when BOTH the global gate and its own gate are on. */
export function beyondMasterCapabilityEnabled(
  capability: BeyondMasterCapability,
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (!beyondMasterCommerceEnabled(env)) return false;
  return isTruthyEnvFlag(env[CAPABILITY_ENV[capability]]);
}

/** Copy shown instead of a proposal when a capability is switched off. */
export function capabilityDisabledMessage(
  capability: BeyondMasterCapability,
): string {
  switch (capability) {
    case "domain_register":
      return "Domain registration is not available from the assistant yet. You can still search for a domain and complete the order from the website when it opens.";
    case "domain_transfer":
      return "Domain transfers are not available from the assistant yet. Support can help you start one manually.";
    case "domain_renew":
      return "Domain renewal from the assistant is not available yet. Use the renew action in your account, or ask support.";
    case "dns_write":
      return "DNS record changes are not available from the assistant yet. Sign in and edit your DNS zone, or ask support.";
    case "nameserver_update":
      return "Nameserver changes are not available from the assistant yet. Sign in and update them in your domain settings, or ask support.";
    case "hosting_checkout":
      return "Hosting checkout is not available from the assistant yet. You can compare plans and complete the order on the website.";
    case "email_provision":
      return "Mailbox provisioning is not available from the assistant yet. Support can help you set it up.";
    case "wallet_topup":
      return "Wallet top-up is not available from the assistant yet. Use the wallet page in your account.";
  }
}
