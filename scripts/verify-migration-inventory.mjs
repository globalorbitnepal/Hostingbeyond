/**
 * Compare prisma/migrations folders to the committed inventory file.
 * Does not connect to a database.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const MIGRATIONS_DIR = path.join(ROOT, "prisma/migrations");
export const INVENTORY_FILE = path.join(MIGRATIONS_DIR, "INVENTORY.txt");
export const REQUIRED_PHASE2 = [
  "20261025120000_namesilo_pricing_provider",
  "20261025130000_transfer_registrar_wallet",
];

/**
 * Beyond Master limited-release tail (timestamp order). Apply on production when
 * promoting PR #15 — commerce table is required by committed schema even though
 * execution stays capability-gated.
 */
export const BEYOND_MASTER_RELEASE_MIGRATIONS = [
  "20261104233000_beyond_master_chat_history",
  "20261106010000_beyond_master_commerce_proposal",
  "20261106200000_beyond_master_ai_rate_budget_support_queue",
];

/** Local/WIP folders that must never ship on this release branch. */
export const EXCLUDED_FROM_RELEASE_MIGRATIONS = [
  "20261107120000_stripe_webhook_event_ledger",
];

export const RELEASE_MIGRATION_DOCS = [
  "docs/BEYOND-MASTER-DATABASE.md",
  "docs/BEYOND-MASTER-PRODUCTION-RELEASE.md",
  "docs/LIMITED-SUPPORT-PRODUCTION-RELEASE.md",
  "docs/LIMITED-SUPPORT-RELEASE-MANIFEST.md",
];

/**
 * @param {string} migrationsDir
 * @returns {string[]}
 */
export function listMigrationFolders(migrationsDir) {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`migrations directory missing: ${migrationsDir}`);
  }
  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{14}_/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

/** On-disk folders counted toward INVENTORY.txt (excludes release WIP such as Stripe). */
export function listMigrationFoldersForInventory(migrationsDir = MIGRATIONS_DIR) {
  const excluded = new Set(EXCLUDED_FROM_RELEASE_MIGRATIONS);
  return listMigrationFolders(migrationsDir).filter((name) => !excluded.has(name));
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function parseInventoryText(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

/**
 * @param {string[]} expected
 * @param {string[]} actual
 */
/**
 * Migration folder names tracked in git (ignores untracked WIP such as Stripe ledger).
 * @param {string} root
 * @returns {string[]}
 */
export function listGitTrackedMigrationFolders(root = ROOT) {
  let out = "";
  try {
    out = execSync("git ls-files prisma/migrations", {
      cwd: root,
      encoding: "utf8",
    });
  } catch {
    return [];
  }
  const names = new Set();
  for (const line of out.split(/\r?\n/)) {
    const m = line.match(/^prisma\/migrations\/(\d{14}_[^/]+)\//);
    if (m) names.add(m[1]);
  }
  return [...names].sort();
}

export function inventoryIsChronological(inventory) {
  const sorted = [...inventory].sort();
  return inventory.every((name, index) => name === sorted[index]);
}

export function compareMigrationInventory(expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const duplicates = [
    ...new Set(expected.filter((name, index) => expected.indexOf(name) !== index)),
  ];
  const missingFromInventory = actual.filter((name) => !expectedSet.has(name));
  const extraInInventory = expected.filter((name) => !actualSet.has(name));
  return {
    ok:
      duplicates.length === 0 &&
      missingFromInventory.length === 0 &&
      extraInInventory.length === 0,
    duplicates,
    missingFromInventory,
    extraInInventory,
    folderCount: actual.length,
    inventoryCount: expected.length,
  };
}

export function loadCommittedInventory(filePath = INVENTORY_FILE) {
  return parseInventoryText(fs.readFileSync(filePath, "utf8"));
}

function main(argv) {
  const folders = listMigrationFoldersForInventory(MIGRATIONS_DIR);
  if (argv.includes("--print")) {
    process.stdout.write(`${folders.join("\n")}\n`);
    process.exit(0);
  }
  const inventory = loadCommittedInventory();
  const result = compareMigrationInventory(inventory, folders);
  for (const name of REQUIRED_PHASE2) {
    if (!folders.includes(name)) {
      process.stderr.write(`verify-migration-inventory: missing required ${name}\n`);
      process.exit(1);
    }
  }
  if (!result.ok) {
    process.stderr.write("verify-migration-inventory: FAIL\n");
    if (result.duplicates.length) {
      process.stderr.write(`duplicates: ${result.duplicates.join(", ")}\n`);
    }
    if (result.missingFromInventory.length) {
      process.stderr.write(
        `folders not in INVENTORY.txt: ${result.missingFromInventory.join(", ")}\n`,
      );
    }
    if (result.extraInInventory.length) {
      process.stderr.write(
        `INVENTORY.txt entries without folders: ${result.extraInInventory.join(", ")}\n`,
      );
    }
    process.exit(1);
  }
  process.stdout.write(
    `verify-migration-inventory: PASS count=${result.folderCount}\n`,
  );
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main(process.argv.slice(2));
}
