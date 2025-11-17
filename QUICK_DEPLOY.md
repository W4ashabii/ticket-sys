# Quick Vercel Deployment

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ticket-sys.git
git push -u origin main
```

## 2. Set Up MongoDB Atlas

1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → Create free account
2. Create cluster → Create database user → Whitelist IP `0.0.0.0/0`
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/`

## 3. Get Gmail App Password

1. [Google Account](https://myaccount.google.com/) → Security
2. Enable 2-Step Verification → App passwords
3. Generate for "Mail" → Copy 16-character password

## 4. Deploy to Vercel

1. [vercel.com](https://vercel.com) → Sign in with GitHub
2. New Project → Import `ticket-sys` repository
3. **Add Environment Variables:**
   - `MONGODB_URI` = your MongoDB connection string
   - `SMTP_PASS` = your Gmail App Password
4. Deploy!

Your app will be live at `https://your-project.vercel.app`

## Required Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `SMTP_PASS` - Gmail App Password

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
