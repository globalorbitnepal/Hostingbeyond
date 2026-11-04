import {
  clientKeyFromRequest,
  consumeRateLimit,
} from "@/lib/http/fixed-window-rate-limit";
import { readBeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";

export function allowBeyondMasterChat(
  request: Request,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const config = readBeyondMasterRuntimeConfig(env);
  const key = `beyond-master:${clientKeyFromRequest(request)}`;
  return consumeRateLimit(key, config.rateLimit, config.rateWindowMs);
}
