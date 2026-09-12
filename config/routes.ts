/**
 * Application routes — single source of truth for internal navigation.
 */

export const routes = {
  home: "/",
  domains: "/domains",
  businessEmail: "/business-email",
  hosting: "/hosting",
  vps: "/vps",
  cloud: "/cloud",
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
