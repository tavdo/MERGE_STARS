# GitHub Actions → VPS deploy setup

Deploy fails in **~5 seconds** (red X) almost always means **SSH never connected** — not a code/build error.

## Required GitHub secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Example | Notes |
|--------|---------|-------|
| `VPS_HOST` | `203.0.113.10` or `mergestars.com` | Server IP or hostname |
| `VPS_USER` | `ubuntu` / `temo` | Linux user that owns the repo |
| `VPS_SSH_KEY` | full private key | See below |
| `VPS_DEPLOY_PATH` | `/home/temo/MERGE_STARS` | Optional; default `$HOME/MERGE_STARS` on server |

## 1. Create deploy SSH key (one time)

On your **local machine**:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/merge-stars-deploy -N "" -C "github-actions-deploy"
```

## 2. Allow this key on the VPS

```bash
# Copy public key to server (replace user@host)
ssh-copy-id -i ~/.ssh/merge-stars-deploy.pub USER@YOUR_SERVER_IP

# Or manually append to server:
# cat ~/.ssh/merge-stars-deploy.pub >> ~/.ssh/authorized_keys
```

Test login:

```bash
ssh -i ~/.ssh/merge-stars-deploy USER@YOUR_SERVER_IP
```

## 3. Add private key to GitHub

Copy **entire** private key (including first/last line):

```bash
cat ~/.ssh/merge-stars-deploy
```

Paste into secret **`VPS_SSH_KEY`**.

Must look like:

```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

## 4. Prepare the server (one time)

On the VPS:

```bash
git clone https://github.com/tavdo/MERGE_STARS.git
cd MERGE_STARS
cp .env.example .env
nano .env   # FRONTEND_URL=https://yourdomain.com

sudo apt update && sudo apt install -y nginx
# Node.js 20+ required

chmod +x deploy/install-server.sh deploy/deploy.sh
DOMAIN=yourdomain.com ./deploy/install-server.sh
```

## 5. Re-run deploy

After secrets are set:

- **Actions** → **Deploy to VPS** → **Run workflow** (manual), or
- push any commit to `main`

Success = green check, run takes **1–5 minutes** (npm install + build).

## Manual deploy (if Actions still fails)

SSH to server:

```bash
cd ~/MERGE_STARS
git pull origin main
./deploy/deploy.sh
git log -1 --oneline   # should match latest commit on GitHub
```

## Verify on server

```bash
cd ~/MERGE_STARS
git log -1 --oneline
sudo systemctl status merge-stars-backend
ls -la frontend/dist/index.html
```

## Common errors

| Symptom | Cause | Fix |
|---------|--------|-----|
| Fails in ~5s | Wrong/missing `VPS_HOST`, `VPS_USER`, or `VPS_SSH_KEY` | Re-check secrets |
| `Permission denied (publickey)` | Public key not on server | `ssh-copy-id` again |
| `cd: ... No such file` | Repo not cloned on VPS | Clone repo to `VPS_DEPLOY_PATH` |
| `npm: command not found` | Node not installed on VPS | Install Node 20+ |
| `nest: not found` | Dev deps skipped during build | Fixed in deploy.sh — run latest `git pull` |
| `EBADENGINE` / Node 18 | Server Node too old | Upgrade to Node 20: NodeSource setup script |
| Build OK but site old | Browser cache | Hard refresh Ctrl+Shift+R |
