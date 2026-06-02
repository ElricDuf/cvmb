# Backend (Node.js + Prisma)

Fast start:

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. From the repository root, run `npm install` once.
3. Start the stack with `npm run dev:quick`.

That command starts PostgreSQL, prepares Prisma, applies migrations if needed,
seeds the DB on a fresh install, then starts the backend.

If you want only the backend, use `npm --prefix backend run dev`.

> `npm run setup:db` enchaîne migrations + seed + seed-admins.

## Espace gestionnaire (admin) — API

Toutes les routes sont préfixées par `/api/admin` et exigent un en-tête
`Authorization: Bearer <token>` (le token est renvoyé par `/api/auth/login`).

- `admin_local` : accès limité aux diagnostics/statistiques de **sa** CCI.
- `admin_national` (super-admin) : accès à toutes les CCI + gestion globale
  (CCI, questions, réponses, messages de recommandation, comptes admin).

### Dashboard
- `GET /api/admin/me` — contexte de l'admin connecté.
- `GET /api/admin/diagnostics` — liste paginée (`page`, `pageSize`, `search`,
  `statut`, `difficulteMin`, `difficulteMax`, `from`, `to`, et pour le national `cciId`, `region`).
- `GET /api/admin/diagnostics/export` — export CSV (mêmes filtres).
- `GET /api/admin/stats` — agrégats : part AVEC/SANS login, envoi mail,
  abandons par étape, répartition des scores, réponses aux questions.
- `GET /api/admin/ccis`, `GET /api/admin/regions` — listes pour les filtres.

> "AVEC login" = le dirigeant a finalisé son compte (mot de passe personnel
> défini) ; "SANS login" = compte encore en mot de passe temporaire.
> "Difficulté %" = 100 − score de santé.

### Super-admin (admin_national uniquement)
- CCI : `POST/PATCH/DELETE /api/admin/ccis[/:id]`
- Questions : `GET/POST/PATCH/DELETE /api/admin/questions[/:id]`
  (suppression = désactivation si la question a déjà des réponses enregistrées).
- Réponses possibles : `POST /api/admin/questions/:id/reponses`,
  `PATCH/DELETE /api/admin/reponses/:id`.
- Messages de recommandation : `GET/POST/PATCH/DELETE /api/admin/recommandations[/:id]`.
- Comptes admin : `GET/POST/PATCH /api/admin/admins[/:id]`
  (la création renvoie un mot de passe temporaire à transmettre une seule fois).

## Comptes de démonstration (via `npm run db:seed:admins`)
- Super-admin national : `superadmin@cvmb.fr` / `SuperAdmin123!`
- Admin local (CCI 33) : `admin@cci33.fr` / `AdminCci123!`
- Admin local (CCI 75) : `admin@cci75.fr` / `AdminCci123!`

## Frontend
- `/admin/questionnaires` — tableau de bord des diagnostics.
- `/admin/statistiques` — statistiques (Général, Abandons, Répartition, Réponses).
- `/admin/super` — console super-admin (national uniquement).
