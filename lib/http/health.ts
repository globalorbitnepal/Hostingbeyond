/** Process liveness only — never queries the database or reads secrets. */
export type HealthPayload = {
  ok: true;
  service: "hostingbeyond";
};

export function healthPayload(): HealthPayload {
  return { ok: true, service: "hostingbeyond" };
}
