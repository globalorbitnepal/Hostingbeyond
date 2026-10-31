# Aapki site ki suraksha — Desktop folder (simple Hindi)

**Aapka folder:** `Desktop\hostingbeyond`

## Ye kya hai?

Ye **poori live website ka backup bank** hai — jaise `https://hosting.theglobalorbit.com/` ab chal rahi hai:

- Website design (code Git se restore hota hai)
- **Database** — customers, login, orders (encrypted dump)
- **Orbit** uploads / files
- API / backend ke liye zaroori data + metadata

Har raat **Nepal 11 baje (23:00)**, jab aapka PC **ON** ho, Windows apne aap server se **nayi encrypted copy** le kar `current\` folder update karta hai. Purani copies `backups\` mein retention ke hisaab se rehti hain.

## Aapko kya karna hai?

**Roz:** kuch nahi — bas 11 baje ke aas-paas PC on rakhein (internet chalu).

**Ek baar (server side):** jab tak pehli successful copy na aa jaye, VPS par pairing chahiye (hum / GitHub Action se kar sakte hain). Uske baad aap **zero coding**.

Status dekhein: `Desktop\hostingbeyond\APKA-STATUS-HINDI.txt`  
Audit: `reports\desktop-audit.json`

## Server mar gaya / hack — kya karein?

1. Naya **Linux server** (Ubuntu, Node 22, PostgreSQL) — **shared cPanel “upload folder” se ye site nahi chalegi**; HostingBeyond Node + Postgres app hai.
2. `README-RECOVERY.md` follow karke restore (ya apni hosting team).
3. Password manager se **production `.env`** (Stripe, NameSilo, Google, DB secrets) — ye backup ke andar **nahi** aata (security).
4. Desktop se **decrypt** karke database + files restore → site phir **same** chal sakti hai.

## cPanel / dusra server?

| Soch                                      | Sach                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Folder cPanel mein daalun, site chal jaye | **Nahi** — ye runnable website folder nahi, **encrypted backup** hai |
| Naya VPS, restore runbook                 | **Haan** — yehi design hai                                           |
| Live jaisa same data                      | **Haan**, jab backup **SUCCESS** ho aur restore sahi ho              |

## Automatic setup (ek baar)

Repo se double-click (ya support se chalwayein):

`ops\windows-backup\Setup-DesktopBank-FULL-AUTO.bat`

Ya PowerShell (jo aap pehle use kar chuke ho):

```powershell
$t=Join-Path $env:TEMP 'hbfin'; Remove-Item $t -Recurse -Force -ErrorAction SilentlyContinue
git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $t
& (Join-Path $t 'ops\windows-backup\Setup-DesktopBank-FullAuto.ps1')
```

## Age key (bahut zaroori)

`keys\backup-age-identity.txt` — **password manager** mein bhi rakhein. Iske bina encrypted database recover nahi hota.

---

**Bottom line:** Ye aapki site ko **safe bank** ki tarah rakhta hai — har raat update, server disaster par **same site** restore possible. Ye cPanel shortcut nahi hai; ye **professional disaster recovery** hai.
