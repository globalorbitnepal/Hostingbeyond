import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  BEYOND_MASTER_RELEASE_MIGRATIONS,
  EXCLUDED_FROM_RELEASE_MIGRATIONS,
  REQUIRED_PHASE2,
  RELEASE_MIGRATION_DOCS,
  compareMigrationInventory,
  inventoryIsChronological,
  listGitTrackedMigrationFolders,
  listMigrationFolders,
  listMigrationFoldersForInventory,
  loadCommittedInventory,
  parseInventoryText,
  MIGRATIONS_DIR,
} from "./verify-migration-inventory.mjs";

describe("verify-migration-inventory", () => {
  it("matches committed inventory to prisma/migrations folders", () => {
    const folders = listMigrationFoldersForInventory(MIGRATIONS_DIR);
    const inventory = loadCommittedInventory();
    const result = compareMigrationInventory(inventory, folders);
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(folders.length, inventory.length);
    const raw = listMigrationFolders(MIGRATIONS_DIR);
    for (const excluded of EXCLUDED_FROM_RELEASE_MIGRATIONS) {
      if (raw.includes(excluded)) {
        assert.equal(
          inventory.includes(excluded),
          false,
          `${excluded} may exist on disk as WIP but must not be in INVENTORY.txt`,
        );
      }
    }
    for (const name of REQUIRED_PHASE2) {
      assert.ok(folders.includes(name), name);
    }
  });

  it("detects folders missing from inventory", () => {
    const result = compareMigrationInventory(
      ["20260829120000_orbit_cms_init"],
      [
        "20260829120000_orbit_cms_init",
        "20261025120000_namesilo_pricing_provider",
      ],
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
    assert.deepEqual(result.extraInInventory, [
      "20990101000000_does_not_exist",
    ]);
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

  it("matches inventory to git-tracked migration folders (release tree)", () => {
    const tracked = listGitTrackedMigrationFolders();
    const inventory = loadCommittedInventory();
    const result = compareMigrationInventory(inventory, tracked);
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(tracked.length, inventory.length);
    for (const excluded of EXCLUDED_FROM_RELEASE_MIGRATIONS) {
      assert.equal(
        inventory.includes(excluded),
        false,
        `excluded migration must not be in INVENTORY.txt: ${excluded}`,
      );
      assert.equal(
        tracked.includes(excluded),
        false,
        `excluded migration must not be git-tracked: ${excluded}`,
      );
    }
  });

  it("lists INVENTORY.txt in chronological (lexicographic) order", () => {
    const inventory = loadCommittedInventory();
    assert.equal(
      inventoryIsChronological(inventory),
      true,
      `INVENTORY.txt out of order: ${inventory.join(", ")}`,
    );
  });

  it("includes the Beyond Master release tail in inventory and tracked folders", () => {
    const inventory = loadCommittedInventory();
    const tracked = listGitTrackedMigrationFolders();
    for (const name of BEYOND_MASTER_RELEASE_MIGRATIONS) {
      assert.ok(inventory.includes(name), `inventory missing ${name}`);
      assert.ok(tracked.includes(name), `git missing ${name}`);
    }
    const invTail = BEYOND_MASTER_RELEASE_MIGRATIONS.map((n) =>
      inventory.indexOf(n),
    );
    const sortedIdx = [...invTail].sort((a, b) => a - b);
    assert.deepEqual(
      invTail,
      sortedIdx,
      "release migrations must appear in timestamp order inside INVENTORY.txt",
    );
  });

  it("release migration docs mention every Beyond Master release migration", () => {
    const root = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
    );
    for (const rel of RELEASE_MIGRATION_DOCS) {
      const text = fs.readFileSync(path.join(root, rel), "utf8");
      for (const name of BEYOND_MASTER_RELEASE_MIGRATIONS) {
        assert.match(
          text,
          new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          `${rel} must mention ${name}`,
        );
      }
      assert.match(
        text,
        /20261107120000_stripe_webhook_event_ledger/,
        `${rel} must document Stripe ledger exclusion`,
      );
    }
  });

  it("keeps the production preflight runbook free of a stale folder count", () => {
    const root = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
    );
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
