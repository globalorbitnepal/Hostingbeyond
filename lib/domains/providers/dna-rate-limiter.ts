/**
 * Shared reseller-wide gate for Domain Name API HTTP calls (2 req/sec).
 * All bulk-search / catalogue requests must pass through this limiter.
 */

let lastDispatchAt = 0;
let chain: Promise<void> = Promise.resolve();

const MIN_GAP_MS = Number(process.env.DOMAIN_API_MIN_REQUEST_GAP_MS ?? 510);

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withDnaRateLimit<T>(run: () => Promise<T>): Promise<T> {
  let release!: () => void;
  const slot = new Promise<void>((resolve) => {
    release = resolve;
  });

  const previous = chain;
  chain = previous.then(async () => {
    await slot;
  });

  await previous;
  try {
    const now = Date.now();
    const wait = Math.max(0, MIN_GAP_MS - (now - lastDispatchAt));
    if (wait > 0) await sleep(wait);
    lastDispatchAt = Date.now();
    return await run();
  } finally {
    release();
  }
}
