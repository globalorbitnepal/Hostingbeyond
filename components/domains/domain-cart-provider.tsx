"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { routes } from "@/config/routes";
import { dispatchDomainCartUpdated } from "@/lib/domains/domain-cart-events";
import {
  addGuestDomainLine,
  clearGuestDomainCart,
  guestCartSnapshot,
  readGuestDomainCart,
  removeGuestDomainLine,
  type GuestCartLine,
} from "@/lib/domains/guest-domain-cart";

export type DomainCartLine = {
  domain: string;
  status: string;
  register: number;
  renew: number;
  currency: string;
  periodYears?: number;
};

export type DomainCartSnapshot = {
  items: DomainCartLine[];
  count: number;
  total: number;
  currency: string;
};

type AddResult =
  | { ok: true; duplicate?: boolean }
  | { ok: false; error: string; needsAuth?: boolean };

type DomainCartContextValue = {
  cart: DomainCartSnapshot;
  isAuthenticated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refreshCart: () => Promise<void>;
  addDomain: (domain: string) => Promise<AddResult>;
  removeDomain: (domain: string) => Promise<void>;
  domainsInCart: Set<string>;
  checkoutHref: string;
};

const emptyCart: DomainCartSnapshot = {
  items: [],
  count: 0,
  total: 0,
  currency: "USD",
};

const DomainCartContext = createContext<DomainCartContextValue | null>(null);

function mapGuest(lines: GuestCartLine[]): DomainCartLine[] {
  return lines.map((line) => ({
    domain: line.domain,
    status: line.status,
    register: line.register,
    renew: line.renew,
    currency: line.currency,
    periodYears: 1,
  }));
}

function mapServerItems(
  items: Array<{
    domain: string;
    status: string;
    register: number;
    renew: number;
    currency: string;
    periodYears?: number;
  }>,
): DomainCartLine[] {
  return items.map((item) => ({
    domain: item.domain,
    status: item.status,
    register: Number(item.register),
    renew: Number(item.renew),
    currency: item.currency,
    periodYears: item.periodYears ?? 1,
  }));
}

export function DomainCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<DomainCartSnapshot>(emptyCart);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mergeAttempted = useRef(false);

  const applySnapshot = useCallback((snapshot: DomainCartSnapshot) => {
    setCart(snapshot);
    dispatchDomainCartUpdated(snapshot.count);
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/domains/cart", { cache: "no-store" });
      if (res.status === 401) {
        setIsAuthenticated(false);
        const guest = guestCartSnapshot();
        applySnapshot({
          items: mapGuest(guest.items),
          count: guest.count,
          total: guest.total,
          currency: guest.currency,
        });
        return;
      }
      if (!res.ok) return;
      setIsAuthenticated(true);
      const json = (await res.json()) as {
        items?: DomainCartLine[];
        count?: number;
        total?: number;
        currency?: string;
      };
      const items = mapServerItems(json.items ?? []);
      applySnapshot({
        items,
        count: json.count ?? items.length,
        total: json.total ?? 0,
        currency: json.currency ?? "USD",
      });

      const guestDomains = readGuestDomainCart().map((g) => g.domain);
      if (guestDomains.length && !mergeAttempted.current) {
        mergeAttempted.current = true;
        const mergeRes = await fetch("/api/domains/cart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ domains: guestDomains }),
        });
        if (mergeRes.ok) {
          clearGuestDomainCart();
          const merged = (await mergeRes.json()) as {
            cart?: {
              count?: number;
              items?: DomainCartLine[];
              total?: number;
            };
            count?: number;
            items?: DomainCartLine[];
            total?: number;
          };
          const cartPayload = merged.cart ?? merged;
          const mergedItems = mapServerItems(cartPayload.items ?? []);
          applySnapshot({
            items: mergedItems,
            count: cartPayload.count ?? mergedItems.length,
            total: cartPayload.total ?? 0,
            currency: "USD",
          });
        }
      }
    } catch {
      /* ignore */
    }
  }, [applySnapshot]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const addDomain = useCallback(
    async (domain: string): Promise<AddResult> => {
      const trimmed = domain.trim().toLowerCase();
      if (!trimmed) return { ok: false, error: "Invalid domain." };

      try {
        const res = await fetch("/api/domains/cart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ domain: trimmed }),
        });
        if (res.status === 401) {
          const validate = await fetch("/api/domains/validate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ domain: trimmed }),
          });
          const vJson = (await validate.json()) as {
            error?: string;
            domain?: string;
            status?: string;
            register?: number;
            renew?: number;
            currency?: string;
          };
          if (!validate.ok) {
            return {
              ok: false,
              error:
                vJson.error ||
                "This domain is no longer available. Please choose another.",
            };
          }
          const guestResult = addGuestDomainLine({
            domain: vJson.domain ?? trimmed,
            status: vJson.status ?? "available",
            register: vJson.register ?? 0,
            renew: vJson.renew ?? 0,
            currency: vJson.currency ?? "USD",
          });
          const guest = guestCartSnapshot();
          applySnapshot({
            items: mapGuest(guest.items),
            count: guest.count,
            total: guest.total,
            currency: guest.currency,
          });
          return { ok: true, duplicate: guestResult.duplicate };
        }
        const json = (await res.json()) as {
          error?: string;
          count?: number;
          items?: DomainCartLine[];
          total?: number;
        };
        if (!res.ok) {
          return {
            ok: false,
            error:
              json.error ||
              "We couldn't add this domain right now. Please try again.",
          };
        }
        setIsAuthenticated(true);
        const items = mapServerItems(json.items ?? []);
        applySnapshot({
          items,
          count: json.count ?? items.length,
          total: json.total ?? 0,
          currency: "USD",
        });
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: "We couldn't add this domain right now. Please try again.",
        };
      }
    },
    [applySnapshot],
  );

  const removeDomain = useCallback(
    async (domain: string) => {
      const key = domain.trim().toLowerCase();
      if (!isAuthenticated) {
        const count = removeGuestDomainLine(key);
        const guest = guestCartSnapshot();
        applySnapshot({
          items: mapGuest(guest.items),
          count,
          total: guest.total,
          currency: guest.currency,
        });
        return;
      }
      try {
        const res = await fetch(
          `/api/domains/cart?domain=${encodeURIComponent(key)}`,
          { method: "DELETE" },
        );
        if (!res.ok) return;
        const json = (await res.json()) as {
          count?: number;
          items?: DomainCartLine[];
          total?: number;
        };
        const items = mapServerItems(json.items ?? []);
        applySnapshot({
          items,
          count: json.count ?? items.length,
          total: json.total ?? 0,
          currency: "USD",
        });
      } catch {
        /* ignore */
      }
    },
    [applySnapshot, isAuthenticated],
  );

  const checkoutHref = useMemo(() => routes.domainCheckout, []);

  const domainsInCart = useMemo(
    () => new Set(cart.items.map((i) => i.domain.toLowerCase())),
    [cart.items],
  );

  const value = useMemo(
    () => ({
      cart,
      isAuthenticated,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      refreshCart,
      addDomain,
      removeDomain,
      domainsInCart,
      checkoutHref,
    }),
    [
      cart,
      isAuthenticated,
      drawerOpen,
      refreshCart,
      addDomain,
      removeDomain,
      domainsInCart,
      checkoutHref,
    ],
  );

  return (
    <DomainCartContext.Provider value={value}>
      {children}
    </DomainCartContext.Provider>
  );
}

export function useDomainCart(): DomainCartContextValue {
  const ctx = useContext(DomainCartContext);
  if (!ctx) {
    throw new Error("useDomainCart must be used within DomainCartProvider");
  }
  return ctx;
}

/** Optional hook for header when provider might be absent (should not happen). */
export function useDomainCartOptional(): DomainCartContextValue | null {
  return useContext(DomainCartContext);
}
