# /security

Part of the notes for website-css, moved out of `CLAUDE.md` on 2026-10-08 as they were. `CLAUDE.md` holds
what every task needs and the index of these files.

## /security — what its claims rest on (2026-09-19)

Recorded on 2026-10-08 from the discussion of 19 September, so the page's copy stays true. **Check a claim against
these before changing the page's words.**

- **Keys: there is no HSM** (the user, 2026-09-19). On the CometBFT chains the answer is **threshold signing with
  horcrux**: one cluster of **three cosigners, any two of which sign** (2-of-3; since horcrux v3 one cluster signs every
  chain it holds a shard for, so three hosts in all, spread across failure domains but not continents), the key made
  into shards once and the original destroyed everywhere. The true line is "no single machine holds the key", **not**
  "the key cannot be extracted" (the shards are encrypted files). softsign (an encrypted key on one isolated signer host)
  is the fallback where horcrux is not available. **The non-CometBFT chains have no remote signer** — Sui, NEAR,
  Avalanche, Starknet, Mina, Monad, Supra, Vara: the key lives with the node, protected by disk encryption, isolation
  and failover discipline — so the page must not imply the same protection across every network. A YubiHSM with tmkms
  would need our own hardware (USB-attached to the signer host); cloud VMs cannot. On 2026-09-19 no horcrux or tmkms role
  existed in the org; **`encapsulate-xyz/remote-signer-ansible`** (a Horcrux playbook for the Cosmos validators) was
  created on 2026-09-28.
- **Access, as the private `server-setup-playbook` enforces it** (read 2026-09-19): public-key SSH only, no root, no
  passwords; people sign in with **FIDO2 hardware keys** (`sk-ssh-ed25519`); named accounts only (`AllowUsers`), automation
  its own account pinned to one address; **SSH only inside the Tailscale network**, the tailnet ACL in the repo, tested
  and applied by CI with CODEOWNERS; sudo is a list of commands with `su`, `sudo -i`, `sudo -s` denied; **elevation
  expires within an hour** (a systemd timer revokes it); every sudo command is mailed to the team; authorised keys
  root-owned outside home directories; no agent, TCP or X11 forwarding; auditd, fail2ban, Wazuh, Suricata, Trivy, logs
  shipped off the host; a break-glass account on its own port from one address.
- **Gaps found that day** (ops', not changed from here): `rm` and `systemctl start *` in the operators' sudo list (both
  amount to root); `NOPASSWD: ALL` for the ansible and break-glass accounts; no SSH certificate authority (keys never
  expire, no central revocation); no session recording; SSO and MFA on Tailscale and GitHub not confirmed; no automated
  patching or kernel hardening; secrets in ansible-vault rather than Vault at runtime; no backups or tested restore; no
  offboarding task; no alerting on "new sudoers file", "authorized_keys changed", "break-glass used"; no drift check; no
  `security.txt`.
- **The public page says what, never where**: no port numbers, usernames, the break-glass address or "not on port 22" —
  "SSH is reachable only inside the private network" says more and gives a scanner nothing.
