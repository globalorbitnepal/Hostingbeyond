/** Minimal DNA availability env so unit tests can resolve the provider without network I/O. */
export function applyDnaAvailabilityTestEnv(env: NodeJS.ProcessEnv): void {
  env.DOMAIN_API_RESELLER_ID =
    env.DOMAIN_API_RESELLER_ID ?? "unit-test-reseller";
  env.DOMAIN_API_TEST_KEY = env.DOMAIN_API_TEST_KEY ?? "unit-test-dna-key";
  env.DOMAIN_AVAILABILITY_ENV = env.DOMAIN_AVAILABILITY_ENV ?? "test";
}
