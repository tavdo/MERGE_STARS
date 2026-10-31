# MERGE STARS - Developer Handoff

**Start with [DEVELOPER_HANDOFF.md](DEVELOPER_HANDOFF.md).** This repository contains
the current local frontend, backend, concept assets and Linux deployment tooling.
Historical architecture and marketing descriptions below are not verification
that every integration is live. Production deployment is manual by default.

**Luxury Creative Technology Infrastructure — v1.0**

მიმდინარე მოწყობისა და შესწორებების დეტალური გზამკვლევი: [BUILD_DETAILS.md](BUILD_DETAILS.md). რეალური ბაზისა და გაშვების შემოწმების ნაბიჯებიც იქ არის აღწერილი.

> This is not a website. This is a Digital Manufacturing Ecosystem, an AI-assisted 3D Creation Platform, and the foundation of a Future Physical-Digital Identity Network.

---

## URLs

| Environment | Frontend | Backend API |
|-------------|----------|-------------|
| **Local dev** | `http://localhost:5173` | `http://localhost:3000` |
| **Linux VPS** | `http://your-server` (nginx :80) | proxied at `/api` |

---


### Developer Panel Access

The `developer` role is limited to **2 seats** and grants access to:
- `/panel/*` — internal dashboard routes
- API explorer and endpoint testing
- Application logs and error traces
- Feature flag management
- Database query inspector (read-only)

> Developer seats are assigned manually by an `admin` and stored as a scoped claim in the JWT payload.

---

## XIV. Luxury Principles

> Every interaction must feel like a premium product, not a website.

1. **No generic components** — Every UI element is custom-designed
2. **Micro-interactions** — Every hover, click, and scroll has feedback (haptic on mobile)
3. **Typography** — Variable fonts, optical sizing, premium typefaces
4. **Color & Light** — Dark mode default, golden accents, cursor-responsive dynamic lighting
5. **Sound Design** — Subtle UI sounds, spatial audio for 3D scenes
6. **Loading States** — No spinners. Skeletons, progressive reveals, or artistic transitions
7. **Error States** — Even errors feel premium (poetic copy, beautiful illustrations)

---

## Linux server deploy (no Docker)

**Requirements:** Ubuntu/Debian VPS, Node.js 20+, nginx, git.

### First-time setup on the server

```bash
git clone https://github.com/mergestars01/mergestars.git
cd mergestars
cp .env.example .env
# edit .env — set FRONTEND_URL=https://yourdomain.com

sudo apt update
sudo apt install -y nginx
# Node 20: https://github.com/nodesource/distributions

chmod +x deploy/install-server.sh deploy/deploy.sh
DOMAIN=yourdomain.com ./deploy/install-server.sh
```

### Re-deploy after code changes

```bash
cd MERGE_STARS
git pull origin main
./deploy/deploy.sh
```

GitHub Actions (`push` → `main`) runs full deploy over SSH. Set secret **`VPS_DEPLOY_PATH=/var/www/html`**. No manual SSH needed after that.

| Service | Command |
|---------|---------|
| Backend status | `sudo systemctl status merge-stars-backend` |
| Backend logs | `sudo journalctl -u merge-stars-backend -f` |
| Nginx reload | `sudo nginx -t && sudo systemctl reload nginx` |
| HTTPS (Let's Encrypt) | `sudo certbot --nginx -d yourdomain.com` |

---

## Git Workflow

### Branch Structure

| Branch | Purpose |
|--------|---------|
| `main` | Latest stable release on production |
| `develop` | Current development work |
| `feature/xxxx` | New app features — tracks `origin/develop` |
| `fix/xxxx` | Bug fixes on develop/uat/staging — tracks `origin/develop` |
| `hotfix/xxxx` | Urgent production bugs — tracks `main` |

> Replace `xxxx` with the ticket number and a short descriptive title.

### Daily Commitment

Work in progress **must be committed and pushed every day**.

### Merge Requests

**Feature / Fix → `develop`:**
```
[WIP|RFR][FEATURE|FIX][DEVELOP][FRONTEND|API|SOCLE] : Short description
```
---

*This is not a project. This is the future. 🌟*


