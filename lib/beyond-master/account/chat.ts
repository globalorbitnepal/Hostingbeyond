import { consumeRateLimit } from "@/lib/http/fixed-window-rate-limit";
import {
  accountPromptBlock,
  readCustomerAccount,
  type AccountReader,
} from "@/lib/beyond-master/account/read";
import { prismaAccountReader } from "@/lib/beyond-master/account/prisma-reader";
import { isAccountQuestion } from "@/lib/beyond-master/account/intent";
import type { AccountRead } from "@/lib/beyond-master/account/types";
import { recordBeyondMasterUsage } from "@/lib/beyond-master/usage";

let readerOverride: AccountReader | null = null;

export function setBeyondMasterAccountReaderForTests(
  reader: AccountReader | null,
) {
  if (process.env.NODE_ENV === "production") return;
  readerOverride = reader;
}

export async function accountEventForChat(
  message: string,
  userId: string | null,
  ip: string,
): Promise<{ read: AccountRead; prompt: string } | null> {
  if (!isAccountQuestion(message)) return null;
  if (
    userId &&
    !consumeRateLimit(`beyond-master-account:${userId}`, 20, 10 * 60 * 1000)
  ) {
    const read: AccountRead = {
      tools: [],
      signInRequired: false,
      cards: [
        {
          kind: "notice",
          message: "Too many account lookups. Please try again shortly.",
        },
      ],
    };
    return { read, prompt: accountPromptBlock(read) };
  }
  const read = await readCustomerAccount({
    userId,
    message,
    reader:
      process.env.NODE_ENV !== "production" && readerOverride
        ? readerOverride
        : prismaAccountReader,
  });
  if (!read) return null;
  if (userId) {
    await recordBeyondMasterUsage({
      provider: "account",
      model: read.tools.join(",") || "none",
      status: "account_read",
      customerUserId: userId,
      ip,
    });
  }
  return { read, prompt: accountPromptBlock(read) };
}
