Ticket Counter
==============

A Next.js 16 ticketing console for issuing QR-coded tickets, emailing them to attendees, and scanning them at check-in. Auth is restricted to approved Google accounts so only authorized issuers can create or validate tickets.

Features
--------
- Issue tickets with name, email, university ID, and single-use QR code.
- Email delivery with embedded QR and serial details (SMTP/Gmail friendly).
- Real-time scanner (camera or manual entry) that prevents duplicate use.
- Attendee list with search and ticket validity status.
- Admin-only access via Google OAuth and an allowed email allowlist.

Tech Stack
----------
- Next.js 16 (App Router) + TypeScript
- NextAuth with Google provider
- MongoDB for ticket storage and counters
- QR generation via `qrcode` and `@yudiel/react-qr-scanner`
- Mailing via `nodemailer`
- pnpm for package management

Getting Started
---------------
### Prerequisites
- Node.js 20+
- pnpm 8+
- MongoDB database URI
- Google OAuth credentials (web client)
- SMTP credentials (for outbound ticket emails)

### Setup
1) Install dependencies:
```
pnpm install
```
2) Create `.env.local` in the project root:
```
MONGODB_URI=mongodb+srv://...
MONGODB_DB=tickets

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# Comma-separated list of issuer emails; leave blank to allow any Google account
ALLOWED_ISSUER_EMAILS=issuer1@example.com,issuer2@example.com

# 32+ character secret; falls back to a random value if omitted
JWT_SECRET=your-long-random-secret

# SMTP (Gmail-friendly defaults)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Ticket Desk <you@gmail.com>
```
3) Run the app:
```
pnpm dev
```
Visit `http://localhost:3000`.

### OAuth callback
Set the Google OAuth authorized redirect URI to:
```
http://localhost:3000/api/auth/callback/google
```

Available Scripts
-----------------
- `pnpm dev` – start Next.js in development.
- `pnpm build` – production build.
- `pnpm start` – run the built app.
- `pnpm lint` – lint the project.

Key Flows
---------
- Admin: Sign in with an allowed Google account, create tickets from `/admin`; tickets are numbered, QR-coded, and emailed when SMTP is configured.
- Attendees: View and search issued tickets at `/attendees`.
- Scanner: Validate tickets via camera or manual entry at `/scanner`; scans are single-use.

Deployment Notes
----------------
- Ensure the production domain is added as a Google OAuth authorized origin/callback.
- Provide production `MONGODB_URI`, `JWT_SECRET`, and SMTP credentials.
- Keep `ALLOWED_ISSUER_EMAILS` current to control admin access.
