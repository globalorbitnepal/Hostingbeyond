/**
 * Read-only interpretation of a DNS proposal. This module does not call a DNS
 * provider and does not change proposal rows. An uncertain or executing proposal
 * is never treated as a reason to repeat a write.
 */
export type DnsObservation = {
  recordId?: string | null;
  type: string;
  host: string;
  value: string;
};

export type DnsReconcileInput = {
  status: string;
  providerStatus: string | null;
  verified: boolean | null;
  action: "add" | "update" | "delete";
  type: string;
  host: string;
  value: string;
  recordId: string | null;
};

export type DnsReconcileState =
  "verified" | "mismatched" | "unresolved" | "not_executed";

export type DnsReconcileResult = {
  state: DnsReconcileState;
  writesAttempted: 0;
  usedStoredResult: boolean;
};

export function reconcileObservedDns(
  input: DnsReconcileInput,
  records: readonly DnsObservation[] | null,
): DnsReconcileResult {
  if (input.verified === true)
    return { state: "verified", writesAttempted: 0, usedStoredResult: true };
  if (input.verified === false)
    return { state: "mismatched", writesAttempted: 0, usedStoredResult: true };
  if (!needsObservation(input))
    return {
      state: "not_executed",
      writesAttempted: 0,
      usedStoredResult: true,
    };
  if (!records)
    return { state: "unresolved", writesAttempted: 0, usedStoredResult: false };
  return {
    state: observedMatch(input, records) ? "verified" : "mismatched",
    writesAttempted: 0,
    usedStoredResult: false,
  };
}

function needsObservation(input: DnsReconcileInput) {
  return (
    input.status === "executing" ||
    input.providerStatus === "uncertain" ||
    (input.status === "executed" && input.providerStatus === "accepted")
  );
}

function observedMatch(
  input: DnsReconcileInput,
  records: readonly DnsObservation[],
) {
  if (input.action === "delete") {
    return !records.some(
      (record) => record.recordId && record.recordId === input.recordId,
    );
  }
  return records.some(
    (record) =>
      record.type.toUpperCase() === input.type.toUpperCase() &&
      record.host.toLowerCase() === input.host.toLowerCase() &&
      record.value === input.value,
  );
}
