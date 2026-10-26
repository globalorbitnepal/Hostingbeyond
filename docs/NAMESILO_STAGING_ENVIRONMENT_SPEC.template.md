# NameSilo Phase 2 — staging environment specification (TEMPLATE)

**Do not commit this file as `NAMESILO_STAGING_ENVIRONMENT_SPEC.md` until every section below is filled with owner-verified facts.**  
**Preflight requires the root file `NAMESILO_STAGING_ENVIRONMENT_SPEC.md` — not this template.**

Copy to repo root only after approval:

```bash
cp docs/NAMESILO_STAGING_ENVIRONMENT_SPEC.template.md NAMESILO_STAGING_ENVIRONMENT_SPEC.md
# Edit NAMESILO_STAGING_ENVIRONMENT_SPEC.md — replace all <PLACEHOLDER> values
```

---

## Summary

| Field                                            | Owner value                                       |
| ------------------------------------------------ | ------------------------------------------------- |
| Staging approved by                              | `<OWNER_NAME>` / `<DATE>`                         |
| Conflicts with “no staging VPS” policy resolved? | `<YES/NO — reference decision>`                   |
| Production host used as staging?                 | **Must be NO** unless formal isolation documented |

---

## Infrastructure (placeholders — replace with verified values)

| Field                                               | Placeholder                                                     | Verified value |
| --------------------------------------------------- | --------------------------------------------------------------- | -------------- |
| `STAGING_PUBLIC_BASE_URL`                           | `https://<STAGING_PUBLIC_HOST>`                                 |                |
| `STAGING_LISTEN_PORT`                               | `<e.g. 3031>` (must differ from prod `3030` if shared machine)  |                |
| `STAGING_APP_PATH`                                  | `<e.g. /srv/apps/hostingbeyond-staging>`                        |                |
| `STAGING_VPS_HOST`                                  | `<STAGING_IPV4_OR_HOSTNAME — not 51.15.21.166 unless approved>` |                |
| `STAGING_SSH_USER`                                  | `<deploy user>`                                                 |                |
| `STAGING_DATABASE_NAME`                             | `<e.g. hostingbeyond_staging_db>`                               |                |
| `STAGING_DATABASE_HOST`                             | `<PG host>`                                                     |                |
| `STAGING_PM2_PROCESS`                               | `<e.g. hostingbeyond-staging>`                                  |                |
| GitHub secret `STAGING_VPS_HOST` configured?        | `<YES/NO>`                                                      |                |
| `HOSTINGBEYOND_STAGING_MIGRATE_APPROVED` gate owner | `<NAME>`                                                        |                |

---

## Environment policy (names only — no secret values)

| Variable                                     | Staging requirement                                      |
| -------------------------------------------- | -------------------------------------------------------- |
| `DATABASE_URL`                               | Must target **staging DB only**                          |
| `DOMAIN_API_ENV`                             | `test` (OTE) unless owner approves otherwise             |
| `DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER` | `namesilo` only if staging should mirror NameSilo search |
| `NAMESILO_API_KEY`                           | Present only in server `.env` / vault                    |
| `NAMESILO_LIFECYCLE_ENABLED`                 | **`false`** until separate owner approval                |
| `NAMESILO_ALLOW_BILLABLE`                    | **`false`** or unset                                     |
| `STRIPE_SECRET_KEY`                          | Stripe **test** mode only                                |

---

## Phase 2 migrations (staging)

Applied in order on staging DB only:

1. `20261025120000_namesilo_pricing_provider`
2. `20261025130000_transfer_registrar_wallet`

Backup taken before migrate: `<DATE / TICKET / BACKUP LOCATION>`

---

## Sign-off

| Role                   | Name | Date |
| ---------------------- | ---- | ---- |
| Release owner          |      |      |
| DBA / migrate approver |      |      |
