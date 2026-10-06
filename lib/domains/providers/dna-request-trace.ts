export type DnaRequestTrace = {
  requestIndex: number;
  domainCount: number;
  slotAcquiredAt: number;
  httpStartAt: number;
  httpEndAt: number;
};

let requestTraces: DnaRequestTrace[] = [];
let nextIndex = 0;

export function clearDnaRequestTraces(): void {
  requestTraces = [];
  nextIndex = 0;
}

export function getDnaRequestTraces(): DnaRequestTrace[] {
  return [...requestTraces];
}

export function beginDnaRequestTrace(
  domainCount: number,
  slotAcquiredAt: number,
): DnaRequestTrace {
  const trace: DnaRequestTrace = {
    requestIndex: nextIndex++,
    domainCount,
    slotAcquiredAt,
    httpStartAt: Date.now(),
    httpEndAt: 0,
  };
  requestTraces.push(trace);
  return trace;
}

export function endDnaRequestTrace(trace: DnaRequestTrace): void {
  trace.httpEndAt = Date.now();
}

/** @internal */
export function resetDnaRequestTracesForTests(): void {
  clearDnaRequestTraces();
}
