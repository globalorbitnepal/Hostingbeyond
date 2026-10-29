# Google Cloud Translation (HostingBeyond)

Server-only Cloud Translation v3 for storefront copy. The free website widget is
not used. This document never asks for JSON key contents and never prints them.

**Implemented code is not the same as a verified live API session.** Translation
stays fail-closed until an operator enables it, places a service-account file
outside Git, and separately confirms that the Cloud Translation API is enabled
and a real request succeeds.

## What the app does today

- Header/footer Hostinger-style country & language selector is unchanged.
- Preference is stored in the existing `hb_prefs` cookie (1 year).
- English HTML is still the source. When a non-English market is selected, the
  browser asks `POST /api/i18n/translate` for visible text nodes only.
- Prices, domains, product ids, and currency amounts are not sent to the vendor.
- Navigation, links, forms, and nodes marked `translate="no"` / `notranslate`
  are left alone.
- A status note appears when a non-English market is selected. It does **not**
  claim the whole site is translated.

## Environment variables

| Name                                | Role                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| `GOOGLE_TRANSLATE_ENABLED`          | Must be the exact string `true` or the adapter stays off. |
| `GOOGLE_CLOUD_PROJECT`              | GCP project id. Use `hostingbeyond-513017`.               |
| `GOOGLE_APPLICATION_CREDENTIALS`    | Absolute path to the service-account JSON file (ADC).     |
| `GOOGLE_TRANSLATE_CREDENTIALS_PATH` | Optional override path if you do not want to reuse ADC.   |

Do **not** put JSON key material in `.env`, client code, Git, or chat.

`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are OAuth login only. They are not
used for translation.

## Local setup (dev checkout)

Work only in `/home/sysadmin/dev/Hostingbeyond`. Do not copy files into
`/srv/apps/hostingbeyond`.

### Windows → Linux (do not paste the JSON)

Intended Linux path:

`/home/sysadmin/secure/hostingbeyond/google-translate-sa.json`

Preferred: copy over SSH from Windows (PowerShell). Do not email, chat, or commit the file.

```
ssh sysadmin@YOUR_LINUX_HOST "mkdir -p /home/sysadmin/secure/hostingbeyond && chmod 700 /home/sysadmin/secure /home/sysadmin/secure/hostingbeyond"
scp "C:\Users\YOUR_USER\Downloads\YOUR-KEY.json" sysadmin@YOUR_LINUX_HOST:/home/sysadmin/secure/hostingbeyond/google-translate-sa.json
```

Then on Linux:

```
chmod 600 /home/sysadmin/secure/hostingbeyond/google-translate-sa.json
stat -c '%a %U:%G %n' /home/sysadmin/secure/hostingbeyond/google-translate-sa.json
```

Expect `600 sysadmin:sysadmin`. Never `cat` the file.

If you already use WinSCP/SFTP as `sysadmin`, upload to that same path (not into the Git checkout).

1. Store the downloaded JSON **outside the repo** at the path above.
2. Restrict permissions: `chmod 600` on the file; directory `700`.
3. In local `.env` (gitignored), set path-only values:

```
GOOGLE_TRANSLATE_ENABLED="true"
GOOGLE_CLOUD_PROJECT="hostingbeyond-513017"
GOOGLE_APPLICATION_CREDENTIALS="/home/sysadmin/secure/hostingbeyond/google-translate-sa.json"
```

4. Confirm Cloud Translation API is enabled on project `hostingbeyond-513017`
   in Google Cloud Console → APIs & Services (this machine had no `gcloud` CLI
   during implementation, so enablement was **not** verified here).
5. Grant the service account the Cloud Translation API User role on that project.
6. Restart the **dev** server, pick a non-English market, and only then treat a
   successful `POST /api/i18n/translate` as live connectivity.

## Production / hosting server (when you later deploy)

Do not deploy from this change set unless you separately approve Git + Actions.

1. Place the JSON outside the Git tree, for example
   `/home/hostingbeyond/secrets/google-translate-sa.json`, owned by the
   `hostingbeyond` runtime user, mode `600`.
2. Set the same four variables in the **server** `.env` (not in the repo).
   Prefer `GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_TRANSLATE_CREDENTIALS_PATH`.
3. Keep `GOOGLE_TRANSLATE_ENABLED` unset or `false` until the file is in place
   and the API is enabled. Fail-closed means English copy, not a fake translation.
4. After deploy (separate step), `GET /api/i18n/translate` should report
   `"configured": true` only when the enable flag and path are set. That still
   does not prove a billed translate succeeded — confirm with one authorized
   request.

## Limits

- 40 strings per request, 500 characters each, 6000 characters total.
- 20 POSTs per client per minute (in-process fixed window).
- Source language is English (`en`). Targets are the storefront registry codes:
  `bn`, `pt`, `fr`, `zh-CN`, `de`, `hi`, `ja`, `ne`, `ru`, `es`, `ko`, `id`.
  Language is independent of country/currency. Orbit can disable non-English
  languages without a database migration (`SiteSettings` JSON).

## Remaining before live translation works

1. JSON file on disk (local and later production).
2. Env vars set; process restarted.
3. Cloud Translation API enabled on `hostingbeyond-513017` (unverified here).
4. IAM role on the service account.
5. One authorized real translate request (not performed in this pass).
