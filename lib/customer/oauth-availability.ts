import {
  getOAuthProvider,
  isOAuthProvider,
  type OAuthProvider,
} from "@/lib/customer/oauth";

const ALL_PROVIDERS: OAuthProvider[] = ["google", "github", "facebook"];

export function listConfiguredCustomerOAuthProviders(): OAuthProvider[] {
  return ALL_PROVIDERS.filter((p) => getOAuthProvider(p).configured);
}

export function isCustomerOAuthProviderConfigured(
  provider: string,
): provider is OAuthProvider {
  return isOAuthProvider(provider) && getOAuthProvider(provider).configured;
}

export function customerAuthHints() {
  const configured = listConfiguredCustomerOAuthProviders();
  return {
    googleOAuth: configured.includes("google"),
    emailPassword: true,
    configuredProviders: configured,
  };
}
