import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  REQUIRED_PHASE2,
  compareMigrationInventory,
  listMigrationFolders,
  loadCommittedInventory,
  parseInventoryText,
  MIGRATIONS_DIR,
} from "./verify-migration-inventory.mjs";

describe("verify-migration-inventory", () => {
  it("matches committed inventory to prisma/migrations folders", () => {
    const folders = listMigrationFolders(MIGRATIONS_DIR);
    const inventory = loadCommittedInventory();
    const result = compareMigrationInventory(inventory, folders);
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(folders.length, 21);
    for (const name of REQUIRED_PHASE2) {
      assert.ok(folders.includes(name), name);
    }
  });

  it("detects folders missing from inventory", () => {
    const result = compareMigrationInventory(
      ["20260829120000_orbit_cms_init"],
      ["20260829120000_orbit_cms_init", "20261025120000_namesilo_pricing_provider"],
    );
    assert.equal(result.ok, false);
    assert.deepEqual(result.missingFromInventory, [
      "20261025120000_namesilo_pricing_provider",
    ]);
  });

  it("detects inventory entries without folders", () => {
    const result = compareMigrationInventory(
      ["20260829120000_orbit_cms_init", "20990101000000_does_not_exist"],
      ["20260829120000_orbit_cms_init"],
    );
    assert.equal(result.ok, false);
    assert.deepEqual(result.extraInInventory, ["20990101000000_does_not_exist"]);
  });

  it("detects duplicate inventory entries", () => {
    const result = compareMigrationInventory(
      ["20260829120000_orbit_cms_init", "20260829120000_orbit_cms_init"],
      ["20260829120000_orbit_cms_init"],
    );
    assert.equal(result.ok, false);
    assert.deepEqual(result.duplicates, ["20260829120000_orbit_cms_init"]);
  });

  it("parses comments and blank lines out of inventory text", () => {
    const names = parseInventoryText(
      "# comment\n\n20260829120000_orbit_cms_init\n",
    );
    assert.deepEqual(names, ["20260829120000_orbit_cms_init"]);
  });

  it("keeps the production preflight runbook free of a stale folder count", () => {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const runbook = fs.readFileSync(
      path.join(root, "docs/PRODUCTION-PREFLIGHT-RUNBOOK.md"),
      "utf8",
    );
    assert.doesNotMatch(runbook, /Repo migration folders \(19\)/);
    assert.doesNotMatch(runbook, /B9 vs repo \(19 folders\)/);
    assert.match(runbook, /prisma\/migrations\/INVENTORY\.txt/);
    assert.match(runbook, /20261025120000_namesilo_pricing_provider/);
    assert.match(runbook, /20261025130000_transfer_registrar_wallet/);
  });
});
