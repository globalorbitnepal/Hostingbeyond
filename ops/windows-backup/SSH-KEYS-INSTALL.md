# SSH keys for backup (owner review — do not run from dev agent)

**Two keys required.** Never reuse the GitHub Actions deploy key. Private keys stay on Windows only. **Public age recipient only** on VPS (`~/.config/hostingbeyond-backup/age-recipient.txt`).

## 1. Install age public recipient on VPS (after owner approval)

```bash
# As hostingbeyond on production — owner executes manually
mkdir -p ~/.config/hostingbeyond-backup
chmod 700 ~/.config/hostingbeyond-backup
# Paste PUBLIC age recipient line only (starts with age1...)
nano ~/.config/hostingbeyond-backup/age-recipient.txt
chmod 600 ~/.config/hostingbeyond-backup/age-recipient.txt
```

Do **not** copy the age **identity** (private key) to the VPS.

## 2. `authorized_keys` entries (review before applying)

Append to `/home/hostingbeyond/.ssh/authorized_keys`:

```
# CREATE — runs bundle export only; rejects client commands
command="/srv/apps/hostingbeyond/ops/backup/production/ssh-forced-backup.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA...CREATE_KEY_COMMENT

# FETCH — streams ~/backup-export/LATEST.bundle.tar.age only; rejects client commands
command="/srv/apps/hostingbeyond/ops/backup/production/ssh-forced-fetch.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA...FETCH_KEY_COMMENT
```

Replace public key lines with outputs of:

```powershell
Get-Content D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\keys\hostingbeyond-backup-create_ed25519.pub
Get-Content D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\keys\hostingbeyond-backup-fetch_ed25519.pub
```

## 3. Safety properties

| Key    | Forced script          | Client remote command                        |
| ------ | ---------------------- | -------------------------------------------- |
| CREATE | `ssh-forced-backup.sh` | Rejected via `SSH_ORIGINAL_COMMAND`          |
| FETCH  | `ssh-forced-fetch.sh`  | Rejected; only `cat` of vetted `LATEST` path |

`ssh-forced-fetch.sh` resolves symlinks and refuses paths outside `~/backup-export` or without `.tar.age` suffix.

**SCP is not used** (incompatible with strict `command=` on create key). Transfer uses FETCH key stdout stream.

## 4. Permissions

```bash
chmod 700 ~/backup-export
chmod 755 /srv/apps/hostingbeyond/ops/backup/production/ssh-forced-*.sh
```

**NOT EXECUTED** by automation in the dev repository.
