# CVMB Project

Stack
- Frontend: Next.js
- Backend: Node.js (Express)
- Database: PostgreSQL with Prisma
- PDF generation: react-pdf

Quick start

1. Start PostgreSQL locally with Docker:

```bash
podman compose up -d postgres
```

2. The backend is already configured to use `postgresql://cvmb:cvmb@localhost:5432/cvmb?schema=public`.
2. Install dependencies:

```bash
cd frontend
npm install
cd ../backend
npm install
```

3. Initialize Prisma (from `backend`):

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run apps:

```bash
npm run dev
```

This single command starts the backend first, then launches the frontend once the API is ready.
On a fresh database, it also runs migrations and seeders automatically before starting the API.

Files of interest
- frontend
- backend
