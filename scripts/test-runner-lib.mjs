/**
 * Pure helpers for scripts/run-node-tests.mjs (unit-tested without spawning Node tests).
 */

export function parseTapSummary(output) {
  const lines = output.split("\n");
  const pick = (prefix) => {
    const matches = lines.filter((line) => line.startsWith(prefix));
    const last = matches.at(-1);
    return Number(last?.slice(prefix.length).trim() ?? "0");
  };
  return {
    fail: pick("# fail "),
    cancelled: pick("# cancelled "),
    pass: pick("# pass "),
    skipped: pick("# skipped "),
    tests: pick("# tests "),
  };
}

export function resolveExitCode(childStatus, summary, rawOutput = "") {
  let exitCode = childStatus ?? 1;
  if (summary.fail > 0 || summary.cancelled > 0) {
    exitCode = 1;
  }
  const accounted =
    summary.pass + summary.fail + summary.cancelled + summary.skipped;
  if (summary.tests > 0 && accounted < summary.tests) {
    exitCode = 1;
  }
  if (
    summary.fail === 0 &&
    summary.cancelled === 0 &&
    /\bnot ok \d+/.test(rawOutput)
  ) {
    exitCode = 1;
  }
  return exitCode;
}

export function integrationModeFromEnv(env = process.env) {
  const mode = (env.INTEGRATION_TESTS ?? "auto").trim().toLowerCase();
  if (["required", "1", "true", "yes"].includes(mode)) return "required";
  if (["skip", "0", "false", "no"].includes(mode)) return "skip";
  return "auto";
}

export function shouldFailWhenIntegrationBlocked(mode, ready) {
  if (ready) return false;
  return mode === "required";
}
