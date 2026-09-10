# HostingBeyond

Enterprise web hosting platform — Next.js site + Orbit Super Admin CMS.

## Stack

Next.js 15 · TypeScript · Tailwind CSS · Shadcn UI · Framer Motion · GSAP · Prisma · PostgreSQL

## Scripts

```bash
npm run dev                 # local development
npm run build               # production build
npm run start               # start production server
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:migrate:deploy
npm run db:seed             # load Orbit CMS defaults into Postgres
npm run db:export           # dump live Orbit CMS JSON (needs working DATABASE_URL)
npm run db:import           # restore from data/db/orbit-content-seed.json
npm run db:generate-seed    # rebuild seed JSON from lib/orbit/defaults.ts
```

## Clone to another server (full site + Orbit data)

1. Clone this repo
2. Copy `.env.example` → `.env` and set real values:
   - `DATABASE_URL` (Postgres)
   - `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL`
   - `ORBIT_ENROLLMENT_SECRET`, `ORBIT_SESSION_SECRET`
   - `ORBIT_RP_ID` + `ORBIT_ORIGIN` for the new domain
3. `npm install`
4. `npx prisma migrate deploy`
5. `npm run db:import` (or `npm run db:seed`)
6. `npm run build && npm run start`

Portable CMS dump: `data/db/orbit-content-seed.json` (home, login, site settings).

### Notes

- `.env` is never committed (secrets).
- Orbit passkeys are device + domain bound — re-enroll on a new domain via `/orbit`.
- Uploaded media goes in `public/uploads` / `data/uploads` (empty in repo unless you add files).
- If you have a live DB with extra Orbit edits, run `npm run db:export` there, commit the updated JSON, then `npm run db:import` on the new server.
