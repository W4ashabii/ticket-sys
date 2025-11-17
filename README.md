## Ticket Counter

A modern Next.js ticket management system with admin registration, QR scanner validation, email delivery, and MongoDB persistence. Built with TypeScript and Tailwind CSS.

### Features
- Admin panel to register attendees (name + mail) and auto-generate ticket numbers
- Automatic QR code generation per ticket for phone-ready passes
- Embedded camera scanner to validate tickets and prevent duplicates
- Nodemailer-powered confirmation emails with QR code inline
- Attendee tracking page with search and validation
- API routes for tickets, scanning, email, and metrics
- MongoDB storage for persistent data

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

### Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/ticket-sys.git
   cd ticket-sys
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MongoDB URI and Gmail App Password
   ```

3. **Run development server**
   ```bash
   pnpm dev
   ```

4. **Visit** `http://localhost:3000`

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

**Required:**
- `MONGODB_URI` - MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/`)
- `SMTP_PASS` - Gmail App Password (see setup below)

**Optional (with defaults):**
- `MONGODB_DB` - Database name (defaults to `tickets`)
- `SMTP_HOST` - SMTP server (defaults to `smtp.gmail.com`)
- `SMTP_PORT` - SMTP port (defaults to `587`)
- `SMTP_USER` - SMTP username (defaults to `sidftww@gmail.com`)
- `EMAIL_FROM` - Email sender (defaults to `sidftww@gmail.com`)

**Gmail App Password Setup:**
1. Go to [Google Account](https://myaccount.google.com/) → Security
2. Enable 2-Step Verification (if not already enabled)
3. Go to "App passwords" → Generate new app password
4. Select "Mail" and your device
5. Copy the 16-character password → Use as `SMTP_PASS`

### Deployment to Vercel

**Quick Steps:**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repository
4. Add environment variables (`MONGODB_URI` and `SMTP_PASS`)
5. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions or [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for a quick start guide.

### Development

```bash
pnpm install
pnpm dev        # Start Next.js dev server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

### Routes

- `/` - Dashboard with ticket metrics
- `/admin` - Register new tickets
- `/scanner` - Validate tickets via QR scan
- `/attendees` - View all attendees and search
