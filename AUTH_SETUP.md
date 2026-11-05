# Authentication setup

1. Copy `.env.example` to `.env.local`.
2. Set a PostgreSQL connection string in `DATABASE_URL`.
3. Generate a random authentication secret:

   ```bash
   openssl rand -base64 48
   ```

   Put the result in `AUTH_SECRET`.
4. Create the authentication tables:

   ```bash
   psql "$DATABASE_URL" -f sql/001_auth.sql
   ```
5. Add a user and replace the example email:

   ```bash
   psql "$DATABASE_URL" -c "INSERT INTO pmg_users (email, name, role) VALUES ('you@yourcompany.com', 'Your Name', 'learner') ON CONFLICT (email) DO NOTHING;"
   ```
6. Add your SMTP2Go API key to `SMTP2GO_API_KEY`.
7. Set `SMTP2GO_SENDER` to a verified sender address in SMTP2Go, including a display name if desired.
8. Start the app with `npm run dev`.

Email OTP is required for every sign-in. TOTP is optional: users can enable it from their
profile after signing in. Once enabled, sign-in requires the email OTP followed by the
authenticator app code. Disabling TOTP returns the account to email OTP-only authentication.

