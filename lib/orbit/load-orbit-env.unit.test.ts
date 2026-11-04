import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  hydrateOrbitEnvFromFile,
  isIsolatedStagingDatabase,
} from "@/lib/orbit/load-orbit-env";

const originalSession = process.env.ORBIT_SESSION_SECRET;
const originalEnrollment = process.env.ORBIT_ENROLLMENT_SECRET;

afterEach(() => {
  restore("ORBIT_SESSION_SECRET", originalSession);
  restore("ORBIT_ENROLLMENT_SECRET", originalEnrollment);
});

function restore(
  key: "ORBIT_SESSION_SECRET" | "ORBIT_ENROLLMENT_SECRET",
  value: string | undefined,
) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

function envFile(contents: string) {
  const dir = mkdtempSync(join(tmpdir(), "orbit-env-"));
  const path = join(dir, "sample.env");
  writeFileSync(path, contents, { mode: 0o600 });
  return path;
}

describe("orbit file secret isolation", () => {
  it("recognizes only the private staging database", () => {
    assert.equal(
      isIsolatedStagingDatabase(
        "postgresql://hostingbeyond_integration_user:secret@127.0.0.1:55432/hostingbeyond_integration_test",
      ),
      true,
    );
    assert.equal(
      isIsolatedStagingDatabase(
        "postgresql://hostingbeyond_user:secret@127.0.0.1:5432/hostingbeyond_db",
      ),
      false,
    );
    assert.equal(isIsolatedStagingDatabase(undefined), false);
    assert.equal(isIsolatedStagingDatabase(""), false);
    assert.equal(isIsolatedStagingDatabase("not a url"), false);
    assert.equal(
      isIsolatedStagingDatabase(
        "postgresql://hostingbeyond_user:secret@127.0.0.1:55432/hostingbeyond_integration_test",
      ),
      false,
    );
    assert.equal(
      isIsolatedStagingDatabase(
        "postgresql://hostingbeyond_integration_user:secret@127.0.0.1/hostingbeyond_integration_test",
      ),
      false,
    );
  });

  it("keeps process secrets when the database is isolated staging", () => {
    process.env.ORBIT_SESSION_SECRET = "staging-session";
    process.env.ORBIT_ENROLLMENT_SECRET = "staging-enrollment";
    const path = envFile(
      "ORBIT_SESSION_SECRET=file-session\nORBIT_ENROLLMENT_SECRET=file-enrollment\n",
    );

    hydrateOrbitEnvFromFile({
      paths: [path, path],
      databaseUrl:
        "postgresql://hostingbeyond_integration_user:secret@127.0.0.1:55432/hostingbeyond_integration_test",
    });

    assert.equal(process.env.ORBIT_SESSION_SECRET, "staging-session");
    assert.equal(process.env.ORBIT_ENROLLMENT_SECRET, "staging-enrollment");
  });

  it("still replaces process secrets from an explicit file for every other database", () => {
    process.env.ORBIT_SESSION_SECRET = "stale-session";
    process.env.ORBIT_ENROLLMENT_SECRET = "stale-enrollment";
    const path = envFile(
      "ORBIT_SESSION_SECRET=file-session\nORBIT_ENROLLMENT_SECRET=file-enrollment\n",
    );

    hydrateOrbitEnvFromFile({
      paths: [path],
      databaseUrl: "postgresql://app:secret@127.0.0.1:5432/example_db",
    });

    assert.equal(process.env.ORBIT_SESSION_SECRET, "file-session");
    assert.equal(process.env.ORBIT_ENROLLMENT_SECRET, "file-enrollment");
  });
});
