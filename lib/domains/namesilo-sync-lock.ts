let inFlight: Promise<unknown> | null = null;

/** Prevent overlapping NameSilo supplier sync runs in one process. */
export async function withNameSiloSyncLock<T>(
  fn: () => Promise<T>,
): Promise<T> {
  if (inFlight) {
    return inFlight as Promise<T>;
  }
  const run = fn().finally(() => {
    if (inFlight === run) inFlight = null;
  });
  inFlight = run;
  return run;
}

export function isNameSiloSyncInFlight(): boolean {
  return inFlight != null;
}
