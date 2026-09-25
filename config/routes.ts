/**
 * Application routes — single source of truth for internal navigation.
 */

export const routes = {
  home: "/",
  domains: "/domain-name-search",
  domainSearch: "/domain-name-search",
  bulkDomainSearch: "/bulk-domain-search",
  domainTransfer: "/domain-transfer",
  businessEmail: "/business-email",
  websiteMigration: "/website-migration",
  hosting: "/web-hosting",
  vps: "/vps",
  cloud: "/cloud-hosting",
  pricing: "/pricing",
  beyondAi: "/beyond-ai",
  resources: "/resources",
  about: "/about",
  contact: "/contact",
  login: "/login",
  signup: "/signup",
  account: "/account",
  getStarted: "/signup",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
