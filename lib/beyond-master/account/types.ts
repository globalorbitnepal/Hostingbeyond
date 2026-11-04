export type AccountCard =
  | {
      kind: "domain";
      name: string;
      status: string;
      active: boolean;
      registeredAt: string | null;
      expiresAt: string | null;
      nameservers: string[];
      nameserversUnavailable: boolean;
    }
  | {
      kind: "hosting";
      product: string;
      plan: string;
      status: string;
      active: boolean;
      billingCycle: string;
      expiresAt: string | null;
      recordedTotal: string | null;
      currency: string;
      specs: { label: string; value: string }[];
      ssl: string | null;
    }
  | {
      kind: "invoice";
      number: string;
      amount: string;
      currency: string;
      status: string;
      dueAt: string | null;
      paidAt: string | null;
    }
  | {
      kind: "wallet";
      balance: string;
      currency: string;
      available: boolean;
    }
  | {
      kind: "transaction";
      type: string;
      status: string;
      amount: string;
      currency: string;
      createdAt: string;
    }
  | {
      kind: "payment";
      reference: string;
      amount: string;
      currency: string;
      status: string;
      createdAt: string;
    }
  | {
      kind: "service";
      name: string;
      serviceType: "domain" | "hosting";
      status: string;
      active: boolean;
    }
  | { kind: "notice"; message: string };

export type AccountRead = {
  tools: string[];
  cards: AccountCard[];
  signInRequired: boolean;
};
