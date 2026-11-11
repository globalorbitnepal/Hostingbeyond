import { prisma } from "@/lib/prisma";

import {
  customerProfileStoreId,
  readCustomerJsonBag,
  writeCustomerJsonBag,
} from "@/lib/panel/customer-json-store";

export type NotificationChannel = "sms" | "whatsapp" | "email";

export type NotificationPrefs = {
  subscriptions: Record<NotificationChannel, boolean>;
  security: Record<NotificationChannel, boolean>;
  service: Record<NotificationChannel, boolean>;
  offers: Record<NotificationChannel, boolean>;
};

export type ProfileShare = {
  id: string;
  email: string;
  direction: "request" | "give";
  status: "pending" | "active";
  createdAt: string;
};

export type StoredCustomerProfile = {
  address: string;
  phone: string;
  company: string;
  displayCurrency: string;
  recoveryEmail: string;
  totpEnabled: boolean;
  totpSecret: string | null;
  totpPendingSecret: string | null;
  notifications: NotificationPrefs;
  aiMemoryEnabled: boolean;
  shares: ProfileShare[];
  integrations: {
    github: boolean;
    gitlab: boolean;
    googleAds: boolean;
  };
};

const CHANNELS: NotificationChannel[] = ["sms", "whatsapp", "email"];

function channelBag(
  overrides?: Partial<Record<NotificationChannel, boolean>>,
  emailDefault = true,
): Record<NotificationChannel, boolean> {
  return {
    sms: Boolean(overrides?.sms),
    whatsapp: Boolean(overrides?.whatsapp),
    email: overrides?.email ?? emailDefault,
  };
}

export function defaultCustomerProfile(): StoredCustomerProfile {
  return {
    address: "",
    phone: "",
    company: "",
    displayCurrency: "USD",
    recoveryEmail: "",
    totpEnabled: false,
    totpSecret: null,
    totpPendingSecret: null,
    notifications: {
      subscriptions: channelBag({ sms: true, whatsapp: true, email: true }),
      security: channelBag({ sms: true, whatsapp: true, email: true }),
      service: channelBag({ sms: true, whatsapp: true, email: true }),
      offers: channelBag({ email: true }),
    },
    aiMemoryEnabled: false,
    shares: [],
    integrations: { github: false, gitlab: false, googleAds: false },
  };
}

export async function readCustomerProfile(
  userId: string,
): Promise<StoredCustomerProfile> {
  const bag = await readCustomerJsonBag<Partial<StoredCustomerProfile>>(
    customerProfileStoreId(userId),
    {},
  );
  const base = defaultCustomerProfile();
  return {
    ...base,
    ...bag,
    notifications: {
      subscriptions: {
        ...base.notifications.subscriptions,
        ...bag.notifications?.subscriptions,
      },
      security: {
        ...base.notifications.security,
        ...bag.notifications?.security,
      },
      service: {
        ...base.notifications.service,
        ...bag.notifications?.service,
      },
      offers: { ...base.notifications.offers, ...bag.notifications?.offers },
    },
    integrations: { ...base.integrations, ...bag.integrations },
    shares: Array.isArray(bag.shares) ? bag.shares : [],
  };
}

export async function writeCustomerProfile(
  userId: string,
  data: StoredCustomerProfile,
) {
  await writeCustomerJsonBag(customerProfileStoreId(userId), data);
}

export function sanitizePhone(raw: string) {
  return raw
    .replace(/[^\d+\s()-]/g, "")
    .trim()
    .slice(0, 32);
}

export function sanitizeLine(raw: string, max = 160) {
  return raw.replace(/\s+/g, " ").trim().slice(0, max);
}

export function isAllowedCurrency(code: string) {
  return ["USD", "EUR", "INR", "NPR", "GBP"].includes(code);
}

export function publicProfile(profile: StoredCustomerProfile) {
  return {
    address: profile.address,
    phone: profile.phone,
    company: profile.company,
    displayCurrency: profile.displayCurrency,
    recoveryEmail: profile.recoveryEmail,
    totpEnabled: profile.totpEnabled,
    notifications: profile.notifications,
    aiMemoryEnabled: profile.aiMemoryEnabled,
    shares: profile.shares,
    integrations: profile.integrations,
  };
}

export async function findCustomerByEmail(email: string) {
  return prisma.customerUser.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, name: true },
  });
}

export { CHANNELS };
