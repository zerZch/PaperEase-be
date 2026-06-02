# PaperEase Backend - Agent Instructions

## Package Manager
**pnpm 11 only** — npm is intentionally disabled via `.npmrc` (`ignore-scripts=true`).
```bash
corepack enable
corepack pnpm@11.1.2 install
corepack pnpm@11.1.2 run dev
```
pnpm-workspace.yaml enforces: 24h min release age, no exotic subdeps, strict builds, only `bcrypt` allowed to build.

**Node requirement**: `>=22.13`

## Dev Commands
```bash
pnpm run dev        # nodemon src/server.js
pnpm run start      # node src/server.js
pnpm run db:init    # node scripts/init-db.js
pnpm run db:seed    # node scripts/seed.js
pnpm run test       # jest
```

## Entry Point
`src/server.js` — NOT `backend/index.js` (old path from README). Creates HTTP server with Socket.IO.

## Config
All config centralized in `/config/`:
- `server.js` — port, CORS, auth (saltRounds=10, tokenBytes=64, tokenExpiry=24h), uploads, helmet CSP
- `database.js` — MySQL pool config, supports `DATABASE_URL` or individual vars
- `env.js` — `getEnv()` / `requireEnv()` helpers

**Env var aliases**: The DB init script and database config support Railway-style vars: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQL_URL`, `MYSQL_DATABASE`.

## Database Setup
1. `pnpm run db:init` reads `data/migrations/001_schema.sql`
2. Creates `paperease` database if not using URL connection
3. `pnpm run db:seed` for seed data

## Auth System
Token-based: 64-byte random hex stored in `sesiones` table. Two roles: `1` (Estudiante), `2` (Trabajador Social). Middleware in `src/middleware/auth.js`: `verificarAutenticacion`, `verificarTrabajadorSocial`.

## Routes Structure
| Route | Auth | Purpose |
|---|---|---|
| `/api/auth/*` | — | register, login, logout, verificar, me |
| `/api/novedades` | — | news feed |
| `/api/eventos` | — | events |
| `/api/estadisticas` | requires auth | statistics dashboard |
| `/api/gestion` | requires auth + Trabajador Social | management panel |
| `/api/notificaciones` | requires auth | notifications |
| `/api` | — | forms (formulario) |
| `/` | serves `public/index.html` | frontend entry |
| `/pages/*.html` | static pages | login, registro, menupe, gestion, etc. |

## Testing
Integration tests in `tests/integration/` call `createApp()` directly — no DB required. Unit tests in `tests/unit/`.

## Uploads & Data
- `data/uploads/` is gitignored — user-uploaded files
- `public/` is the frontend/static dir served by Express

## Legacy Redirects
`src/routes/index.js` maps old page names (Login.html, Registro.html, MenuPE.html, etc.) to new kebab-case equivalents via 301 redirects.