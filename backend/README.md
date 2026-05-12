# Backend (Node.js + Prisma)

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies: `npm install`.
3. Generate Prisma client: `npx prisma generate`.
4. Run migrations: `npx prisma migrate dev --name init`.
5. Start server: `npm run dev`.
