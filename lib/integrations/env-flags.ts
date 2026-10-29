/** Exact env flag matching. Do not treat "1" and "true" as interchangeable. */

export function isEnvStrictTrue(value: string | undefined): boolean {
  return value === "true";
}

export function isEnvFlagOne(value: string | undefined): boolean {
  return value === "1";
}

export function isEnvPresent(value: string | undefined): boolean {
  return Boolean(value?.trim());
}
