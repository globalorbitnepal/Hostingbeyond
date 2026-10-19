# VPS backup setup — read-only owner verification

Run **as `hostingbeyond`** on the production app server. **Do not** paste private keys, `.env`, or `authorized_keys` contents into tickets.

## 1. Tools and scripts (read-only)

```bash
cd /srv/apps/hostingbeyond
git rev-parse HEAD
command -v age && age --version | head -1
command -v pg_dump && pg_dump --version | head -1
command -v node && node -v
test -x ops/backup/production/create-pull-bundle.sh && echo OK_create_pull_bundle
test -x ops/backup/production/encrypt-artifact.sh && echo OK_encrypt
test -x ops/backup/production/ssh-forced-backup.sh && echo OK_forced_backup
test -x ops/backup/production/ssh-forced-fetch.sh && echo OK_forced_fetch
```

Expected HEAD: `34e6c3fd560014b2a63acbe8e8563d6c9c15bfdf` (or newer backup-tooling commit).

## 2. Age public recipient (no private identity)

```bash
CFG="$HOME/.config/hostingbeyond-backup"
RF="$CFG/age-recipient.txt"
if test -d "$CFG"; then echo "config_dir_mode=$(stat -c %a "$CFG")"; else echo "config_dir=MISSING"; fi
if test -f "$RF"; then
  echo "recipient_file_size=$(stat -c %s "$RF")"
  echo "recipient_public_lines=$(grep -cE '^age1[A-Za-z0-9]+$' "$RF" || true)"
  echo "identity_secret_lines=$(grep -cE 'AGE-SECRET-KEY|# created:' "$RF" || true)"
else
  echo "recipient_file=MISSING"
fi
```

**PASS criteria:**

- `recipient_public_lines=1`
- `identity_secret_lines=0` (private identity must **not** be on VPS)

## 3. Forced SSH `authorized_keys` (metadata only)

```bash
AK="$HOME/.ssh/authorized_keys"
if test -f "$AK"; then
  echo "forced_backup_entries=$(grep -c 'ssh-forced-backup.sh' "$AK" || true)"
  echo "forced_fetch_entries=$(grep -c 'ssh-forced-fetch.sh' "$AK" || true)"
  echo "port_forwarding_disabled=$(grep -c 'no-port-forwarding' "$AK" || true)"
else
  echo "authorized_keys=MISSING"
fi
```

**PASS criteria:** `forced_backup_entries>=1`, `forced_fetch_entries>=1` (typically exactly **1** each).

Do **not** share the full `authorized_keys` file; report counts only.

## 4. Backup export directory

```bash
BE="$HOME/backup-export"
if test -d "$BE"; then
  echo "backup_export_mode=$(stat -c %a "$BE")"
  echo "latest_symlink=$(test -L "$BE/LATEST.bundle.tar.age" && echo present || echo absent)"
else
  echo "backup_export=MISSING_ok_until_first_run"
fi
```

Recommended before first export: `mkdir -p ~/backup-export && chmod 700 ~/backup-export`

## 5. Non-destructive SSH test (after keys installed — optional)

From Windows, **CREATE** key (no remote command):

```powershell
ssh -i <create-key> -p 22 hostingbeyond@<host>
```

Expected: runs bundle script or fails on missing recipient — **not** a shell.  
**Do not run** until owner approves first export (CREATE runs `pg_dump`).

**FETCH** key streams ciphertext only when `LATEST.bundle.tar.age` exists.

## Related

- `ops/windows-backup/SSH-KEYS-INSTALL.md`
- `ops/backup/production/README.md`
