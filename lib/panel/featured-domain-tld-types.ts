export type FeaturedDomainTld = {
  tld: string;
  /** Orbit 1st-year register price (promo when active). */
  register: number;
  /** Orbit renewal price. */
  renew: number;
  transfer: number | null;
  isPromo: boolean;
};

export type LiveDomainTld = FeaturedDomainTld;
