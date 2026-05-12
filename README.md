# CVMB Project

Stack
- Frontend: Next.js
- Backend: Node.js (Express)
- Database: PostgreSQL with Prisma
- PDF generation: react-pdf

Quick start

1. Start PostgreSQL locally with Docker:

```bash
docker compose up -d postgres
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
# Start backend
cd backend
npm run dev

# In a separate terminal, start frontend
cd frontend
npm run dev
```

Files of interest
- frontend
- backend
