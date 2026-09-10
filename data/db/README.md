# Orbit portable database dumps

- `orbit-content-seed.json` — site settings + home/login CMS sections (safe to commit)
- Regenerate: `npm run db:generate-seed`
- Import on a new server: `npm run db:import` (after `prisma migrate deploy`)
- Export from a live DB: `npm run db:export` (requires working `DATABASE_URL`)
