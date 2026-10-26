#!/usr/bin/env node
/**
 * Read-only staging release preflight. Does not connect to DB, deploy, migrate, or call registrars.
 * Fails closed when no explicit staging target exists in repository configuration.
 *
 * Usage: npm run staging:preflight
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_BRANCH = process.env.STAGING_PREFLIGHT_BRANCH || "main";
const EXPECTED_HEAD =
  process.env.STAGING_PREFLIGHT_HEAD ||
  "d4f430c09b64c41988d6a42f579e527dbdef14db";

const PHASE2_MIGRATIONS = [
  "prisma/migrations/20261025120000_namesilo_pricing_provider/migration.sql",
  "prisma/migrations/20261025130000_transfer_registrar_wallet/migration.sql",
];

const PRODUCTION_DB_NAMES = new Set(["hostingbeyond_db"]);
const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

function fail(msg) {
  return { level: "error", msg };
}

function warn(msg) {
  return { level: "warn", msg };
}

function ok(msg) {
  return { level: "ok", msg };
}

function parseDatabaseUrlMeta(raw) {
  if (!raw?.trim()) return { set: false };
  try {
    const u = new URL(raw.trim());
    const db = u.pathname.replace(/^\//, "").split("?")[0];
    return { set: true, host: u.hostname, database: db };
  } catch {
    return { set: true, invalid: true };
  }
}

function inspectProductionDeployWorkflow(text) {
  const issues = [];
  const workflowName = text.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? "unknown";
  const hasProductionAnchor =
    text.includes("51.15.21.166") && text.includes("hostingbeyond");
  if (hasProductionAnchor) {
    issues.push(
      warn(
        `PRODUCTION_DEPLOY_WORKFLOW: "${workflowName}" targets production VPS — not valid for staging validation`,
      ),
    );
  }
  if (text.includes("HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED")) {
    issues.push(
      warn(
        "PRODUCTION_MIGRATE_GATE: deploy workflow uses HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED — staging must not reuse production DATABASE_URL",
      ),
    );
  }
  return issues;
}

function inspectStagingDeployWorkflow() {
  const stagingPath = path.join(ROOT, ".github/workflows/deploy-staging.yml");
  if (!existsSync(stagingPath)) {
    return [
      fail(
        "STAGING_DEPLOY_WORKFLOW: missing — add .github/workflows/deploy-staging.yml from docs/deploy-staging-workflow.example.yml after STAGING_* secrets exist",
      ),
    ];
  }
  const text = readFileSync(stagingPath, "utf8");
  if (!/\bSTAGING_/i.test(text)) {
    return [
      fail("STAGING_DEPLOY_WORKFLOW: must reference STAGING_* GitHub secrets"),
    ];
  }
  if (
    text.includes("51.15.21.166") &&
    !/\$\{\{\s*secrets\.STAGING_VPS_HOST\s*\}\}/.test(text)
  ) {
    return [
      fail(
        "STAGING_DEPLOY_WORKFLOW: must not hardcode production VPS IP; use secrets.STAGING_VPS_HOST",
      ),
    ];
  }
  return [ok("STAGING_DEPLOY_WORKFLOW: deploy-staging.yml present")];
}

function main() {
  const results = [];
  const cwd = process.cwd();
  if (path.basename(ROOT) !== "Hostingbeyond" && !cwd.endsWith("Hostingbeyond")) {
    results.push(
      warn(`CWD may be outside expected checkout: ${cwd}`),
    );
  } else {
    results.push(ok(`REPO_ROOT: ${ROOT}`));
  }

  let branch;
  let head;
  try {
    branch = sh("git branch --show-current");
    head = sh("git rev-parse HEAD");
    const upstream = sh("git rev-parse @{u} 2>/dev/null || echo none");
    results.push(ok(`GIT_BRANCH: ${branch}`));
    results.push(ok(`GIT_HEAD: ${head}`));
    results.push(ok(`GIT_UPSTREAM: ${upstream}`));
    if (branch !== EXPECTED_BRANCH) {
      results.push(
        warn(`Expected branch ${EXPECTED_BRANCH}, got ${branch}`),
      );
    }
    if (head !== EXPECTED_HEAD) {
      results.push(
        warn(
          `HEAD differs from STAGING_PREFLIGHT_HEAD (${EXPECTED_HEAD.slice(0, 12)}…) — commit Phase 2 may be pending`,
        ),
      );
    }
    const statusLines = sh("git status --short").split("\n").filter(Boolean);
    results.push(ok(`GIT_STATUS_LINES: ${statusLines.length}`));
  } catch (e) {
    results.push(fail(`GIT_UNAVAILABLE: ${e instanceof Error ? e.message : e}`));
  }

  for (const rel of PHASE2_MIGRATIONS) {
    const abs = path.join(ROOT, rel);
    if (existsSync(abs)) {
      results.push(ok(`MIGRATION_PRESENT: ${rel}`));
    } else {
      results.push(fail(`MIGRATION_MISSING: ${rel}`));
    }
  }

  const specPath = path.join(ROOT, "NAMESILO_STAGING_ENVIRONMENT_SPEC.md");
  if (existsSync(specPath)) {
    results.push(ok("STAGING_SPEC_FILE: NAMESILO_STAGING_ENVIRONMENT_SPEC.md"));
  } else {
    results.push(fail("STAGING_SPEC_FILE: missing"));
  }

  const deployPath = path.join(ROOT, ".github/workflows/deploy.yml");
  if (existsSync(deployPath)) {
    const deployText = readFileSync(deployPath, "utf8");
    results.push(...inspectProductionDeployWorkflow(deployText));
  } else {
    results.push(warn("DEPLOY_WORKFLOW: .github/workflows/deploy.yml not found"));
  }
  results.push(...inspectStagingDeployWorkflow());

  const stagingDbNames = new Set([
    "hostingbeyond_staging_db",
    "hostingbeyond_integration_test",
  ]);

  const dbMeta = parseDatabaseUrlMeta(process.env.DATABASE_URL);
  if (!dbMeta.set) {
    results.push(ok("DATABASE_URL_SET: no (expected for local preflight)"));
  } else if (dbMeta.invalid) {
    results.push(fail("DATABASE_URL_SET: yes but URL parse failed"));
  } else {
    results.push(
      ok(
        `DATABASE_URL_SET: yes host=${dbMeta.host} database=${dbMeta.database}`,
      ),
    );
    if (
      PRODUCTION_DB_NAMES.has(dbMeta.database) &&
      !LOCAL_HOSTS.has(dbMeta.host)
    ) {
      results.push(
        fail(
          `PRODUCTION_DB_NAME_ON_REMOTE_HOST: database=${dbMeta.database} host=${dbMeta.host}`,
        ),
      );
    }
    if (dbMeta.database === "hostingbeyond_integration_test") {
      results.push(
        ok("DATABASE_TARGET: disposable integration test name (local)"),
      );
    } else if (stagingDbNames.has(dbMeta.database)) {
      results.push(ok(`DATABASE_TARGET: staging/test name (${dbMeta.database})`));
    } else if (
      dbMeta.database.includes("staging") &&
      !PRODUCTION_DB_NAMES.has(dbMeta.database)
    ) {
      results.push(ok(`DATABASE_TARGET: name suggests staging (${dbMeta.database})`));
    } else if (PRODUCTION_DB_NAMES.has(dbMeta.database)) {
      results.push(
        fail(
          `PRODUCTION_DATABASE_NAME: DATABASE_URL uses ${dbMeta.database} — use isolated staging database`,
        ),
      );
    }
  }

  const errors = results.filter((r) => r.level === "error");
  const warnings = results.filter((r) => r.level === "warn");

  console.log("=== staging-release-preflight ===");
  for (const r of results) {
    const tag = r.level === "error" ? "FAIL" : r.level === "warn" ? "WARN" : "OK";
    console.log(`[${tag}] ${r.msg}`);
  }

  if (errors.length) {
    console.error(
      `\nSTAGING_PREFLIGHT_FAIL: ${errors.length} error(s), ${warnings.length} warning(s)`,
    );
    process.exit(1);
  }

  console.log(
    `\nSTAGING_PREFLIGHT_WARN: 0 errors, ${warnings.length} warning(s) — staging target may still be MISSING; see NAMESILO_STAGING_ENVIRONMENT_SPEC.md`,
  );
  process.exit(0);
}

main();
