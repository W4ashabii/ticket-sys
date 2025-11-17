# Vercel Deployment Guide

Complete guide for deploying the Ticket System to Vercel from GitHub.

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **MongoDB Atlas Account**: Free MongoDB database
3. **Gmail Account**: For sending emails (with App Password)

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/ticket-sys.git

# Push to GitHub
git push -u origin main
```

## Step 2: Set Up MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. **Create Database User:**
   - Database Access → Add New User
   - Username: `ticketadmin` (or your choice)
   - Password: Generate secure password (save it!)
5. **Whitelist IP Addresses:**
   - Network Access → Add IP Address
   - For Vercel: Add `0.0.0.0/0` (allows all IPs) or Vercel's IP ranges
6. **Get Connection String:**
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://ticketadmin:yourpassword@cluster0.xxxxx.mongodb.net/`

## Step 3: Get Gmail App Password

1. Go to [Google Account](https://myaccount.google.com/) → Security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords**
4. Generate new app password:
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → "Ticket System"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces when using: `abcdefghijklmnop`

## Step 4: Deploy to Vercel

### Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your `ticket-sys` repository
5. **Configure Project Settings:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `pnpm build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `pnpm install` (auto-detected)
6. **Add Environment Variables:**
   - Click **"Environment Variables"** before deploying
   - Add each variable (select "Production", "Preview", and "Development"):
     - `MONGODB_URI` = `mongodb+srv://user:pass@cluster.mongodb.net/`
     - `SMTP_PASS` = `your-16-char-app-password` (no spaces)
     - `MONGODB_DB` = `tickets` (optional)
     - `SMTP_HOST` = `smtp.gmail.com` (optional)
     - `SMTP_PORT` = `587` (optional)
     - `SMTP_USER` = `sidftww@gmail.com` (optional)
     - `EMAIL_FROM` = `sidftww@gmail.com` (optional)
7. Click **"Deploy"**
8. Wait for deployment (usually 1-2 minutes)
9. Your app will be live at `https://your-project.vercel.app`

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (first time will ask questions)
vercel

# Add environment variables
vercel env add MONGODB_URI production
vercel env add SMTP_PASS production
# Add other variables as needed

# Deploy to production
vercel --prod
```

## Step 5: Verify Deployment

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. **Test Admin Panel:**
   - Go to `/admin`
   - Create a test ticket
   - Verify ticket is created
3. **Test Email:**
   - Check the email address you used
   - Verify email was received (check spam folder)
   - Verify QR code is visible in email
4. **Test Scanner:**
   - Go to `/scanner`
   - Test QR code scanning (camera should work on HTTPS)
5. **Test Attendees Page:**
   - Go to `/attendees`
   - Verify all tickets are listed
   - Test search functionality

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ Yes | - | MongoDB connection string |
| `SMTP_PASS` | ✅ Yes | - | Gmail App Password (16 chars, no spaces) |
| `MONGODB_DB` | No | `tickets` | Database name |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_USER` | No | `sidftww@gmail.com` | SMTP username |
| `EMAIL_FROM` | No | `sidftww@gmail.com` | Email sender address |

## Updating Environment Variables

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Edit or add variables
4. Redeploy (Vercel will auto-redeploy on next push, or click "Redeploy")

## Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificate

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 20 by default)

### MongoDB Connection Fails
- Verify connection string format is correct
- Check IP whitelist in MongoDB Atlas (add `0.0.0.0/0` for all IPs)
- Verify database user credentials
- Check MongoDB Atlas cluster is running

### Email Not Sending
- Verify `SMTP_PASS` is a Gmail App Password (not regular password)
- Ensure Gmail account has 2-Step Verification enabled
- Check Vercel function logs for SMTP errors
- Verify email address in ticket form is valid

### Camera Not Working
- HTTPS is required for camera access (Vercel provides this automatically)
- Check browser permissions
- Test on mobile device (camera works better on mobile)
- Verify browser supports WebRTC

### Environment Variables Not Working
- Ensure variables are added to correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

## Continuous Deployment

Vercel automatically deploys on every push to your main branch:
- Push to `main` → Production deployment
- Push to other branches → Preview deployment
- Pull requests → Preview deployment

## Monitoring

- **Vercel Dashboard**: View deployments, logs, and analytics
- **Function Logs**: Check API route logs in Vercel dashboard
- **Analytics**: Enable Vercel Analytics for usage stats

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
