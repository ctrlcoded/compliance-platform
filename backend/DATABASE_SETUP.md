# Local Database Setup Guide

## Prerequisites
PostgreSQL must be running on localhost:5432.

---

## Option A: Install PostgreSQL Directly (Windows)

1. Download from https://www.postgresql.org/download/windows/
2. Run the installer (use default port 5432, set password to `postgres`)
3. After install, add to PATH:
   ```
   C:\Program Files\PostgreSQL\17\bin
   ```
4. Open a new terminal and run:
   ```bash
   psql -U postgres -c "CREATE DATABASE fueleu_compliance;"
   ```

## Option B: Use Docker (Recommended)

1. Ensure Docker Desktop is installed and running
2. From project root, run:
   ```bash
   docker run --name fueleu-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fueleu_compliance -p 5432:5432 -d postgres:16-alpine
   ```
3. Verify:
   ```bash
   docker ps
   ```

---

## After Database is Running

Run these commands **in order** from `backend/`:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Run migrations (creates all tables)
npx prisma migrate dev --name init

# 3. Seed the database
npx prisma db seed

# 4. Open Prisma Studio to visually verify data
npx prisma studio
```

---

## .env File (already created at backend/.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fueleu_compliance?schema=public"
JWT_SECRET="fueleu_dev_secret_key_change_in_production"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
LOG_LEVEL=info
```

> If your PostgreSQL user/password differ, update DATABASE_URL accordingly.

---

## Troubleshooting

### Connection refused
- PostgreSQL service is not running
- Check: `pg_isready` or `Get-Service *postgres*`
- Fix: Start the service or Docker container

### Database does not exist
- Run: `psql -U postgres -c "CREATE DATABASE fueleu_compliance;"`
- Or via Docker: database is auto-created via `POSTGRES_DB` env var

### Migration fails
- Check DATABASE_URL in `.env` is correct
- Run `npx prisma db push` as a fallback (skips migration history)

### Seed fails
- Ensure migrations ran first (tables must exist)
- Check for FK constraint errors (seed deletes in correct order)
- Run `npx prisma studio` to inspect table state

### Prisma Client not found
- Run `npx prisma generate` before any other command

---

## Verification Checklist

After seed completes, open `npx prisma studio` and verify:

- [ ] `ship_compliance` table: 6 rows, mix of positive and negative CB
- [ ] `routes` table: 18 rows (3 per ship), first route per ship has `is_baseline = true`
- [ ] `bank_entries` table: 3 rows (IMO-1 BANK, IMO-5 APPLY, IMO-6 BANK)
- [ ] `pools` table: 1 row
- [ ] `pool_members` table: 3 rows (IMO-4, IMO-2, IMO-3)
- [ ] All `pool_members.pool_id` references valid `pools.id`
- [ ] All `bank_entries.(ship_id, year)` references valid `ship_compliance.(ship_id, year)`
