# Sanitized preflight evidence log (example format)

**Do not** include `DATABASE_URL`, passwords, or `.env` contents in real logs.

```
=== HostingBeyond production preflight ===
Date (UTC): 2026-10-20T12:00:00Z
Operator: <name>
Host confirmed: YES
EXPECTED_DB_NAME: hostingbeyond_db
PREFLIGHT_TARGET database=hostingbeyond_db server_addr=127.0.0.1
PASS: database target confirmed

-- B2 beyond_ai rows --
 old_beyond_ai_rows | new_beyond_ai_rows
--------------------+--------------------
                  0 |                  1

-- B4 duplicate register --
 duplicate_register_inflight_groups
------------------------------------
                                  0

-- B8 summary --
 total_migration_rows | finished_rows | unfinished_rows
----------------------+---------------+-----------------
                   19 |            19 |               0

-- B10 HostingOrderCheckout table_exists --
 object_name          | table_exists
----------------------+--------------
 HostingOrderCheckout |            1

-- B11 duplicates --
(0 rows)

Deploy SHA at time of check: 78a30a79cf3ff318f548653bc56e754fd00a2ab1
Note: deploy success does not prove migrate ran.

Overall: PASS
Backup executed separately: NO
Migrate secret off: YES
```

Replace values with **your** query output. If any STOP condition in `docs/PRODUCTION-PREFLIGHT-RUNBOOK.md` §5 triggers, set `Overall: STOP` and do not enable migrate.
