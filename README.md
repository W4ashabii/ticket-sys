## Campus Ticket Ops

A Next.js 14 ticket management system with admin registration, scanner validation, email delivery, and optional MongoDB persistence. Built with TypeScript and Tailwind CSS.

### Features
- Admin panel to register attendees (name + mail) and auto-generate ticket numbers
- Automatic QR + barcode assets per ticket for phone-ready passes
- Embedded camera scanner (with manual override) to validate and prevent duplicates
- Nodemailer-powered confirmation emails with the QR/barcode inline
- API routes for tickets, scanning, email re-sends, and metrics
- In-memory storage by default with optional MongoDB support via `MONGODB_URI`

### Project Structure
```
app/
  page.tsx                # Dashboard overview
  admin/                  # Ticket registration experience
  scanner/                # Validation console
  api/                    # REST endpoints (tickets, scan, email)
components/
  ui/                     # Buttons, inputs, cards, toasts
  admin/                  # Ticket form
  scanner/                # Scanner widget
lib/
  storage.ts              # In-memory + MongoDB store
  email.ts                # Nodemailer transport + template
types/
  ticket.ts               # Shared interfaces
```

### Environment Variables
```
MONGODB_URI="mongodb+srv://..."    # REQUIRED - MongoDB connection string
MONGODB_DB="tickets"               # optional, defaults to "tickets"

# Gmail SMTP (defaults to sidftww@gmail.com)
SMTP_HOST="smtp.gmail.com"         # optional, defaults to smtp.gmail.com
SMTP_PORT="587"                    # optional, defaults to 587
SMTP_USER="sidftww@gmail.com"       # optional, defaults to sidftww@gmail.com
SMTP_PASS="your-app-password"      # REQUIRED: Gmail App Password (not regular password)
EMAIL_FROM="sidftww@gmail.com"     # optional, defaults to sidftww@gmail.com
```

**Gmail App Password Setup:**
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to "App passwords" (under Security)
4. Generate a new app password for "Mail"
5. Copy the 16-character password and set it as `SMTP_PASS`

If `SMTP_PASS` is missing, ticket creation still works but email delivery is skipped with a logged warning.

### Development
```bash
pnpm install
pnpm dev        # start Next.js dev server
pnpm lint       # run ESLint via next lint
```

Visit `http://localhost:3000` for the dashboard. Admin and scanner routes reside at `/admin` and `/scanner`.
