/**
 * Production deploy gate — static tests (intended path: ops/ci/deploy-gate.static.test.mjs).
 * Proposal copy: run from repo root:
 *   node --test ops/ci/proposed/deployment-gate-pr/staged/ops/ci/deploy-gate.static.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  automaticDeployAllowed,
  manualDeployAllowed,
  productionMigrateAllowed,
} from "./deploy-gate-authorize.mjs";

const CI_DIR = dirname(fileURLToPath(import.meta.url));
/** Repository root (worktree or checkout). */
const ROOT = join(CI_DIR, "../..");
const WORKFLOW = join(ROOT, ".github/workflows/deploy.yml");
const RELEASE_GATE = join(ROOT, "docs/RELEASE-GATE.md");

const workflowYaml = readFileSync(WORKFLOW, "utf8");
const releaseGateDoc = readFileSync(RELEASE_GATE, "utf8");

function stepBlock(yaml, stepName) {
  const marker = `      - name: ${stepName}`;
  const start = yaml.indexOf(marker);
  assert.ok(start >= 0, `step not found: ${stepName}`);
  const tail = yaml.slice(start + marker.length);
  const next = tail.search(/\n      - name: /);
  return next >= 0 ? tail.slice(0, next) : tail;
}

function stepIndex(yaml, stepName) {
  const names = [...yaml.matchAll(/      - name: (.+)/g)].map((x) => x[1]);
  const idx = names.indexOf(stepName);
  assert.ok(idx >= 0, `step not in list: ${stepName}`);
  return idx;
}

function runGateShell(deployApproved) {
  const script = `
set -euo pipefail
DEPLOY_APPROVED="${deployApproved ?? ""}"
if [ "\${DEPLOY_APPROVED:-}" != "true" ]; then
  echo "DEPLOY_BLOCKED"
  exit 1
fi
echo "DEPLOY_OK"
`;
  return spawnSync("bash", ["-c", script], { encoding: "utf8" });
}

test("RELEASE-GATE documents deploy approval secret", () => {
  assert.match(releaseGateDoc, /HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED/);
});

test("bash gate matches authorize helper (unset, false, true)", () => {
  for (const v of [undefined, "", "false", "TRUE"]) {
    const r = runGateShell(v);
    assert.notEqual(r.status, 0);
    assert.match(r.stdout + r.stderr, /DEPLOY_BLOCKED/);
    assert.equal(automaticDeployAllowed(v), false);
  }
  const ok = runGateShell("true");
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /DEPLOY_OK/);
  assert.equal(automaticDeployAllowed("true"), true);
});

test("manual deploy authorization unchanged (independent of production deploy secret)", () => {
  assert.equal(manualDeployAllowed(undefined, "DEPLOY"), false);
  assert.equal(manualDeployAllowed("true", "DEPLOY"), true);
});

test("migrate gate logic unchanged (independent secret)", () => {
  assert.equal(productionMigrateAllowed(undefined), false);
  assert.equal(productionMigrateAllowed("true"), true);
});

test("workflow: auto gate runs only on workflow_run and precedes SSH preflight", () => {
  const gateBlock = stepBlock(workflowYaml, "Production code deploy authorization (fail closed)");
  assert.match(gateBlock, /if: github\.event_name == 'workflow_run'/);
  assert.doesNotMatch(gateBlock, /workflow_dispatch/);
  assert.match(gateBlock, /HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED/);
  assert.match(gateBlock, /DEPLOY_BLOCKED: automatic production deploy is disabled/);
  assert.match(gateBlock, /!= "true"/);
  assert.match(gateBlock, /exit 1/);

  const gateIdx = stepIndex(workflowYaml, "Production code deploy authorization (fail closed)");
  const sshIdx = stepIndex(workflowYaml, "Confirm SSH secrets exist");
  assert.ok(gateIdx < sshIdx, "gate before SSH secret step");
});

test("workflow: manual steps still require MANUAL_DEPLOY_APPROVED and DEPLOY input", () => {
  const manualAck = stepBlock(workflowYaml, "Manual deploy acknowledgment (bypasses CI-success path)");
  const manualSecret = stepBlock(workflowYaml, "Manual deploy repository approval (fail closed)");
  assert.match(manualAck, /if: github\.event_name == 'workflow_dispatch'/);
  assert.match(manualAck, /confirm_manual_deploy/);
  assert.match(manualSecret, /HOSTINGBEYOND_MANUAL_DEPLOY_APPROVED/);
  assert.doesNotMatch(manualSecret, /HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED/);
});

test("workflow: migrate step still fail-closed and not tied to deploy approval secret", () => {
  const migrate = stepBlock(workflowYaml, "Production migrate deploy gate (fail closed)");
  assert.match(migrate, /HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED/);
  assert.doesNotMatch(migrate, /HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED/);
  assert.match(migrate, /MIGRATE_SKIPPED/);
});

test("workflow: repair workflows untouched (no deploy approval secret)", () => {
  const repairPath = join(ROOT, ".github/workflows/repair-vps-database.yml");
  const repair = readFileSync(repairPath, "utf8");
  assert.doesNotMatch(repair, /HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED/);
});

test("workflow: deploy.yml defines exactly one production deploy authorization step", () => {
  const matches = workflowYaml.match(
    /Production code deploy authorization \(fail closed\)/g
  );
  assert.equal(matches?.length, 1, "single deploy authorization step");
});
