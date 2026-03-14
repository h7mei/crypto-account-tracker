# Crypto Account Tracker

A production-ready crypto portfolio tracker with PostgreSQL and Drizzle ORM.

## Features

- **Authentication**: Email/password signup and login with JWT
- **Portfolio**: Track holdings across multiple accounts (wallets, exchanges, manual)
- **Transactions**: Full transaction history with filtering
- **DeFi**: Staking, liquidity, lending positions
- **Alerts**: Price, portfolio, transaction, and risk alerts
- **Analytics**: Performance charts, asset allocation, risk metrics

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Radix UI
- **Backend**: Express, Drizzle ORM
- **Database**: PostgreSQL

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` - PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/crypto_tracker`)
- `JWT_SECRET` - Secret for signing JWTs (use a strong random string in production)
- `PORT` - Server port (default: 3001)

### 3. Create database and run migrations

```bash
# Generate migrations (already done)
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

Or use `db:push` to sync schema directly (dev only):

```bash
pnpm db:push
```

### 4. Seed demo data (optional)

```bash
pnpm db:seed
```

Creates user `demo@example.com` / `demo1234` with sample accounts and data.

### 5. Run development server

```bash
pnpm dev
```

Starts Vite (frontend) on port 5173 and Express (API) on port 3001. The frontend proxies `/api` to the backend.

## Production Build

```bash
pnpm build
pnpm start
```

- `pnpm build` compiles the server and builds the frontend
- `pnpm start` runs the server and serves the static frontend (set `NODE_ENV=production`)

## API Routes

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/auth/register` | No | Register |
| `POST /api/auth/login` | No | Login |
| `GET /api/auth/me` | Yes | Current user |
| `GET/POST /api/accounts` | Yes | Accounts CRUD |
| `GET/POST /api/tokens` | Yes | Holdings |
| `GET/POST /api/transactions` | Yes | Transactions |
| `GET/POST /api/defi` | Yes | DeFi positions |
| `GET/POST/PATCH/DELETE /api/alerts` | Yes | Alerts |

## Scripts

- `pnpm dev` - Start dev servers (Vite + API)
- `pnpm build` - Build for production
- `pnpm start` - Run production server
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema to DB (dev)
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:seed` - Seed demo data
