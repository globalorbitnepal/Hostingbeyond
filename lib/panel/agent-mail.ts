import { publicId } from "@/lib/domains/transfer-service";
import {
  customerMailStoreId,
  readCustomerJsonBag,
  writeCustomerJsonBag,
} from "@/lib/panel/customer-json-store";

export type QueuedCustomerMail = {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: "queued";
  createdAt: string;
};

type MailBag = { messages: QueuedCustomerMail[] };

const EMAIL = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function validateMailDraft(
  input: Record<string, unknown>,
): { to: string; subject: string; body: string } | null {
  if (
    typeof input.to !== "string" ||
    typeof input.subject !== "string" ||
    typeof input.body !== "string"
  ) {
    return null;
  }
  const to = input.to.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!EMAIL.test(to) || subject.length < 2 || subject.length > 200) {
    return null;
  }
  if (body.length < 2 || body.length > 8_000) return null;
  return { to, subject, body };
}

export async function queueCustomerMail(input: {
  userId: string;
  to: string;
  subject: string;
  body: string;
}): Promise<QueuedCustomerMail> {
  const message: QueuedCustomerMail = {
    id: publicId("MAIL"),
    to: input.to,
    subject: input.subject,
    body: input.body,
    status: "queued",
    createdAt: new Date().toISOString(),
  };
  const bag = await readCustomerJsonBag<MailBag>(
    customerMailStoreId(input.userId),
    {
      messages: [],
    },
  );
  const messages = Array.isArray(bag.messages) ? bag.messages : [];
  messages.unshift(message);
  await writeCustomerJsonBag(customerMailStoreId(input.userId), {
    messages: messages.slice(0, 50),
  });
  return message;
}
