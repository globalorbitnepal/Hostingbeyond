import { extractDomainQuery } from "@/lib/beyond-master/domain-intent";
import {
  prepareDomainRegistrationProposal,
  wantsDomainRegistration,
} from "@/lib/beyond-master/commerce/domain-register";
import {
  prepareHostingCheckoutProposal,
  wantsHostingPurchase,
} from "@/lib/beyond-master/commerce/hosting-checkout";
import {
  prepareNameserverProposal,
  wantsNameserverChange,
} from "@/lib/beyond-master/commerce/nameservers";
import { commercePromptBlock } from "@/lib/beyond-master/commerce/view";
import type { CommerceProposalView } from "@/lib/beyond-master/commerce/types";

export type CustomerOperationsRun = {
  proposal: CommerceProposalView | null;
  notice: string | null;
  promptBlock: string;
};

export async function runCustomerOperationsForChat(input: {
  message: string;
  customerUserId: string | null;
}): Promise<CustomerOperationsRun> {
  if (!input.customerUserId) {
    if (
      wantsDomainRegistration(input.message) ||
      wantsNameserverChange(input.message) ||
      wantsHostingPurchase(input.message)
    ) {
      return {
        proposal: null,
        notice: "Sign in to prepare registration, DNS, or hosting checkout.",
        promptBlock: "",
      };
    }
    return { proposal: null, notice: null, promptBlock: "" };
  }

  if (wantsNameserverChange(input.message)) {
    const prepared = await prepareNameserverProposal({
      customerUserId: input.customerUserId,
      message: input.message,
    });
    if (!prepared.ok) {
      return { proposal: null, notice: prepared.error, promptBlock: "" };
    }
    return {
      proposal: prepared.view,
      notice: null,
      promptBlock: commercePromptBlock(prepared.view),
    };
  }

  if (wantsDomainRegistration(input.message)) {
    const domain =
      extractDomainQuery(input.message) ??
      input.message.match(
        /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24})\b/i,
      )?.[1];
    if (!domain) {
      return {
        proposal: null,
        notice:
          "Tell me which domain name to register (for example bakery.com).",
        promptBlock: "",
      };
    }
    const prepared = await prepareDomainRegistrationProposal({
      customerUserId: input.customerUserId,
      domain,
    });
    if (!prepared.ok) {
      return { proposal: null, notice: prepared.error, promptBlock: "" };
    }
    return {
      proposal: prepared.view,
      notice: null,
      promptBlock: commercePromptBlock(prepared.view),
    };
  }

  if (wantsHostingPurchase(input.message)) {
    const prepared = await prepareHostingCheckoutProposal({
      customerUserId: input.customerUserId,
      message: input.message,
    });
    if (!prepared.ok) {
      return { proposal: null, notice: prepared.error, promptBlock: "" };
    }
    return {
      proposal: prepared.view,
      notice: null,
      promptBlock: commercePromptBlock(prepared.view),
    };
  }

  return { proposal: null, notice: null, promptBlock: "" };
}
