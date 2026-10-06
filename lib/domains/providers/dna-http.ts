import { Agent, fetch as undiciFetch } from "undici";

/** Reused TCP/TLS connections to Domain Name API (live + OTE hosts). */
const agents = new Map<string, Agent>();

function agentFor(origin: string): Agent {
  let agent = agents.get(origin);
  if (!agent) {
    agent = new Agent({
      keepAliveTimeout: 60_000,
      keepAliveMaxTimeout: 120_000,
      connections: 4,
      pipelining: 1,
    });
    agents.set(origin, agent);
  }
  return agent;
}

export const dnaFetch: typeof fetch = (input, init) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const origin = new URL(url).origin;
  return undiciFetch(url, {
    ...init,
    dispatcher: agentFor(origin),
  } as Parameters<typeof undiciFetch>[1]) as unknown as Promise<Response>;
};
