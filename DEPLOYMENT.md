# Deployment Guide - Resume Builder

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud like MongoDB Atlas)
- Domain name (for production)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="mongodb://..."

# NextAuth (Required)
NEXTAUTH_SECRET="generate_using_openssl_rand_-base64_32"
NEXTAUTH_URL="https://yourdomain.com" # Or http://localhost:3000 for local

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Email (Required for OTP)
RESEND_API_KEY="..."
EMAIL_FROM="noreply@yourdomain.com"
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up database:
```bash
npx prisma generate
npx prisma db push
```

3. Run development server:
```bash
npm run dev
```

4. Open: `http://localhost:3000`

## Production Deployment

### Option 1: Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Option 2: Railway/Render

1. Connect repository
2. Add environment variables
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Deploy

### Option 3: Self-Hosted (VPS/Docker)

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

3. Use PM2 or similar for process management

## Post-Deployment

1. Test authentication flow
2. Test resume creation
3. Test PDF download
4. Verify email OTP delivery
5. Check auto-save functionality

## Security Checklist

- ✅ NEXTAUTH_SECRET is random and secure
- ✅ DATABASE_URL uses authentication
- ✅ OAuth credentials are from correct domains
- ✅ Email API key is restricted to your domain
- ✅ HTTPS enabled in production
- ✅ CORS configured properly

## Troubleshooting

**Login not working:**
- Check NEXTAUTH_SECRET is set
- Verify DATABASE_URL is correct
- Check cookies are enabled

**OTP not sending:**
- Verify RESEND_API_KEY
- Check EMAIL_FROM is verified

**Database errors:**
- Run `npx prisma generate`
- Run `npx prisma db push`

## Support

For issues, check:
- README.md for basic setup
- QUICKSTART.md for getting started
- Terminal logs for errors

