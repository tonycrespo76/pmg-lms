# PMG Learning

PMG Learning is a Next.js training and learning management application for Partners Merchant Group.

It includes learner dashboards, training modules and audio lessons, optional email OTP and authenticator-app authentication, PostgreSQL-backed data, and an admin module manager.

## Features

- Responsive learner dashboard and training course catalog
- 23 PMG training modules with existing transcripts and audio
- Secure sign-in with SMTP2Go-delivered email OTP codes for accounts without TOTP
- Optional TOTP enrollment and verification with an authenticator app
- PostgreSQL-backed users, OTP codes, and learning modules
- Admin interface for creating, editing, publishing, and deleting modules
- Protected learner and administrator routes
- PMG website-inspired navy, gold, cream, and green visual design

## Requirements

- Node.js 20 or later
- npm
- PostgreSQL
- An SMTP2Go API account

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/tonycrespo76/pmg-lms.git
   cd pmg-lms
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Configure the required values described in [Authentication setup](AUTH_SETUP.md).

5. Initialize the database:

   ```bash
   psql "$DATABASE_URL" -f sql/001_auth.sql
   psql "$DATABASE_URL" -f sql/002_modules.sql
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open http://localhost:3000.

## Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PGSSL` | Set to `require` for PostgreSQL hosts that require SSL |
| `AUTH_SECRET` | Random secret used to sign secure session cookies |
| `SMTP2GO_API_KEY` | SMTP2Go API key |
| `SMTP2GO_SENDER` | Verified sender address, optionally including a display name |

Generate a session secret with:

```bash
openssl rand -base64 48
```

Never commit `.env.local` or expose API keys in client-side code.

## Database setup

The SQL files create the authentication and module tables:

- `sql/001_auth.sql` creates users, email OTP codes, and module tables.
- `sql/002_modules.sql` creates modules if needed and seeds the 23 existing PMG modules.

If the module table already exists from `001_auth.sql`, running both scripts is safe for the provided schema and seed data.

## Add an administrator

```bash
psql "$DATABASE_URL" -c "INSERT INTO pmg_users (email, name, role) VALUES ('admin@yourcompany.com', 'PMG Administrator', 'admin') ON CONFLICT (email) DO NOTHING;"
```

Administrators can access `/admin`. Learner accounts should use the `learner` role.

## Authentication flow

1. User enters an email address registered in `pmg_users`.
2. The app creates a hashed six-digit OTP and sends it through SMTP2Go.
3. The user submits the OTP.
4. Accounts without TOTP receive and enter an email OTP.
5. Accounts with TOTP enabled receive no email OTP and enter an authenticator code directly.
6. TOTP setup is optional and can be enabled or disabled from `/profile`.

Email OTP codes expire after 10 minutes and are invalidated after use or replacement.

## Development commands

```bash
npm run dev
npm run build
npm run start
```

## Main routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Authenticated learner | Learning dashboard |
| `/login` | Public | Email OTP and TOTP sign-in |
| `/modules/[id]` | Authenticated learner | Training module |
| `/admin` | Administrator | Module management |

## Deployment

Before deploying:

- Use HTTPS and a production PostgreSQL instance.
- Set `PGSSL=require` when required by the database provider.
- Generate a unique production `AUTH_SECRET`.
- Configure `SMTP2GO_SENDER` using an address verified in SMTP2Go.
- Apply both SQL files to the production database.
- Run `npm run build` and verify the application.
