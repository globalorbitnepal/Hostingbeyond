/**
 * Production deploy gate — static tests (intended path: ops/ci/deploy-gate.static.test.mjs).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { manualDeployAllowed, productionMigrateAllowed } from "./deploy-gate-authorize.mjs";

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

test("RELEASE-GATE documents push-to-main deploy chain", () => {
  assert.match(releaseGateDoc, /push.*main/i);
  assert.match(releaseGateDoc, /Typecheck/);
});

test("workflow triggers on push to main (not workflow_run)", () => {
  assert.match(workflowYaml, /push:\s*\n\s*branches:\s*\n\s*- main/);
  assert.doesNotMatch(workflowYaml, /workflow_run:/);
});

test("workflow: Typecheck job precedes Deploy to VPS", () => {
  assert.match(workflowYaml, /name: Typecheck/);
  assert.match(workflowYaml, /needs: quality/);
  const typecheckIdx = workflowYaml.indexOf("name: Typecheck");
  const deployIdx = workflowYaml.indexOf("name: Deploy to VPS");
  assert.ok(typecheckIdx >= 0 && deployIdx > typecheckIdx);
});

test("manual deploy helper unchanged (legacy emergency secret)", () => {
  assert.equal(manualDeployAllowed(undefined, "DEPLOY"), false);
  assert.equal(manualDeployAllowed("true", "DEPLOY"), true);
});

test("migrate gate logic unchanged (independent secret)", () => {
  assert.equal(productionMigrateAllowed(undefined), false);
  assert.equal(productionMigrateAllowed("true"), true);
});

test("workflow: migrate step still fail-closed", () => {
  const migrate = stepBlock(workflowYaml, "Production migrate deploy gate (fail closed)");
  assert.match(migrate, /HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED/);
  assert.doesNotMatch(migrate, /HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED/);
  assert.match(migrate, /MIGRATE_SKIPPED/);
});

test("workflow: NameSilo API key does not auto-enable public search", () => {
  assert.match(workflowYaml, /merge-namesilo-credentials-env/);
  assert.doesNotMatch(
    workflowYaml,
    /merge-namesilo-search-env/,
    "deploy must not set DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER from API key alone",
  );
  assert.match(workflowYaml, /NAMESILO_SEARCH_UNCHANGED/);
});

test("workflow: SSH preflight follows migrate gate", () => {
  const migrateIdx = stepIndex(workflowYaml, "Production migrate deploy gate (fail closed)");
  const sshIdx = stepIndex(workflowYaml, "Confirm SSH secrets exist");
  assert.ok(migrateIdx < sshIdx, "migrate gate before SSH secret step");
});

test("workflow: pending migrations block code build and restart without approval", () => {
  assert.match(workflowYaml, /pending-migrations-gate\.mjs/);
  assert.match(workflowYaml, /PENDING_MIGRATIONS_BLOCK/);
  assert.match(workflowYaml, /PENDING_MIGRATIONS_REQUIRE_APPROVAL|GATE_ACTION/);
  assert.doesNotMatch(workflowYaml, /code deploy continues/);
});

test("workflow: approved pending migrations run migrate deploy before build", () => {
  const generateIdx = workflowYaml.indexOf("npx prisma generate");
  const gateIdx = workflowYaml.indexOf("pending-migrations-gate.mjs");
  const migrateIdx = workflowYaml.indexOf("npx prisma migrate deploy");
  const buildIdx = workflowYaml.indexOf("npm run build");
  assert.ok(generateIdx >= 0 && gateIdx > generateIdx);
  assert.ok(migrateIdx > gateIdx);
  assert.ok(buildIdx > migrateIdx);
  assert.match(workflowYaml, /MIGRATE_THEN_DEPLOY|GATE_ACTION/);
  assert.match(workflowYaml, /MIGRATE_DEPLOY_FAIL/);
});

test("workflow: documents no automatic schema rollback after migrate", () => {
  assert.match(workflowYaml, /NO_SCHEMA_ROLLBACK/);
});

test("workflow: build and verification failures are explicit", () => {
  assert.match(workflowYaml, /BUILD_FAIL/);
  assert.match(workflowYaml, /VERIFY_FAIL/);
});

test("workflow: repair workflows untouched (no deploy approval secret)", () => {
  const repairPath = join(ROOT, ".github/workflows/repair-vps-database.yml");
  const repair = readFileSync(repairPath, "utf8");
  assert.doesNotMatch(repair, /HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED/);
});
