# Aapka poora goal — seedhi baat (HostingBeyond)

## Aap kya chahte ho (2 hisse)

### 1) Har raat Nepal 11 baje — PC ON ho to auto update

- Folder: `Desktop\hostingbeyond`
- Task: `HostingBeyond-DailyBackup` (23:00 **local** = Kathmandu timezone)
- Server se **nayi encrypted copy** → `current\` + purani `backups\`

**Ye bank ka kaam hai — iske liye Desktop setup "ready" tab hota hai jab audit mein:**

- `nightlyAutoUpdateReady: true`
- `encryptedSiteDataOnPcReady: true`

### 2) Server mar jaye — naye server par **same live site** (zero loss)

Yahan **Desktop folder ko seedha upload nahi karte**. Ye **encrypted backup** hai, runnable website nahi.

**Zero loss ka matlab:**

| Cheez                                        | Backup se aati hai?           | Kahan se?                                             |
| -------------------------------------------- | ----------------------------- | ----------------------------------------------------- |
| Customers, orders, wallet, login records     | Haan                          | Database dump (decrypt ke baad restore)               |
| Orbit images / videos / uploads              | Haan                          | `orbit_uploads` tar (decrypt ke baad)                 |
| Website **design + code** (pages, /orbit UI) | Git se                        | `github.com/globalorbitnepal/Hostingbeyond`           |
| Google Sign-in                               | `.env` + Google Cloud console | Password manager — **backup mein nahi**               |
| NameSilo domain API                          | `.env` `NAMESILO_*`           | Password manager — **backup mein nahi**               |
| Google Translate API                         | `.env` + service account file | Password manager / secure path — **backup mein nahi** |

Naye Linux VPS par: **README-RECOVERY.md** (Desktop par copy) + is repo ke restore steps.

Backup ke andar `metadata/env-inventory.json` sirf **kaunse naam** configure karne hain — **values nahi**.

---

## "100%" ka honest matlab

| Sawal                                                         | Jawab                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| Kya Desktop bank roz 11 baje update ho sakta hai?             | **Haan**, jab PC + internet + audit green                      |
| Kya folder copy karke cPanel / random server = site live?     | **Kabhi nahi**                                                 |
| Kya sahi restore se data + Orbit files + customers wapas?     | **Haan** (design = Git + restore)                              |
| Kya Google / NameSilo / Translate bina `.env` chalenge?       | **Nahi**                                                       |
| Kya humne production par ek baar poora restore test kar liya? | Tab tak **PENDING** jab tak owner lab/production drill na kare |

Audit field `zeroLossRecoveryPathReady` = Desktop par **data copy + keys + runbook + tooling** taiyar.

Audit field `liveSiteOnNewServerWithoutRestoreSteps` = hamesha **false** (by design).

---

## Ek baar PC par (owner)

```powershell
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Desktop\hostingbeyond\_tooling\Hostingbeyond\ops\windows-backup\Confirm-DesktopBank-100Percent.ps1"
```

Ya repo se clone karke wahi script `-BackupRoot` ke saath.

Avast / antivirus: `Desktop\hostingbeyond` ko allow karein — warna raat ko task fail ho sakta hai.

**Age identity** (`keys\backup-age-identity.txt`) ka backup password manager mein rakhein — iske bina encrypted DB recover nahi hoti.
