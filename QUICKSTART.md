# Quick Start Guide

## New Authentication System

Firebase authentication has been completely removed and replaced with NextAuth.js featuring:

✅ **Google OAuth** - One-click sign-in with Google  
✅ **GitHub OAuth** - One-click sign-in with GitHub  
✅ **Email/Password with OTP** - Secure email verification with 6-digit OTP codes

## Getting Started

### 1. Install Dependencies
Already done! All required packages are installed.

### 2. Set Up Environment Variables

Create a `.env` file in the root directory (copy from `.env.example` if available):

```env
# MongoDB Database (Required)
# For MongoDB Atlas: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/resumebuilder?retryWrites=true&w=majority
# For Local MongoDB: mongodb://localhost:27017/resumebuilder
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/resumebuilder?retryWrites=true&w=majority"

# NextAuth (Required)
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional - for Google sign-in)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (Optional - for GitHub sign-in)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email SMTP (Required for email/password signup)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@resumebuilder.com"
```

#### Quick Setup for Testing

**Generate NextAuth Secret:**
```bash
openssl rand -base64 32
```

**Database:** 
- Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for free MongoDB database (recommended)
- Or install MongoDB locally
- See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed setup instructions

**Email:**
- Use Gmail with [App Password](https://myaccount.google.com/apppasswords)
- Or skip OAuth providers and only use email auth

### 3. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB (MongoDB doesn't use migrations)
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 🎉

## What Changed?

### Removed
- ❌ All Firebase code and dependencies
- ❌ `src/firebase/` directory
- ❌ Firebase environment variables
- ❌ `FirebaseClientProvider`
- ❌ `FirebaseErrorListener`

### Added
- ✅ NextAuth.js authentication
- ✅ Prisma ORM with MongoDB
- ✅ OTP email verification system
- ✅ Google OAuth integration
- ✅ GitHub OAuth integration
- ✅ New auth hooks: `useAuth()`, `useAuthActions()`
- ✅ API routes for OTP verification

## File Structure

```
src/
├── app/
│   └── api/
│       └── auth/
│           ├── [...nextauth]/route.ts    # NextAuth handler
│           ├── send-otp/route.ts         # Send OTP email
│           ├── verify-otp/route.ts       # Verify OTP & create account
│           └── resend-otp/route.ts       # Resend OTP
├── components/
│   └── auth-form.tsx                     # New auth form with OTP
├── hooks/
│   └── use-auth.ts                       # Auth hooks
├── lib/
│   ├── auth.ts                           # NextAuth configuration
│   ├── auth-context.tsx                  # Auth provider
│   ├── prisma.ts                         # Prisma client
│   └── email.ts                          # Email sending utilities
└── types/
    └── next-auth.d.ts                    # NextAuth TypeScript types
```

## Usage Examples

### Check if User is Logged In

```tsx
'use client';
import { useAuth } from '@/hooks/use-auth';

export default function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Sign Out

```tsx
import { useAuth } from '@/hooks/use-auth';

export default function LogoutButton() {
  const { signOut } = useAuth();

  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

## OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Add credentials to `.env`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Add callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add credentials to `.env`

## Troubleshooting

**"DATABASE_URL not found"**
- Add DATABASE_URL to your `.env` file

**"NEXTAUTH_SECRET not found"**
- Generate and add NEXTAUTH_SECRET to `.env`

**OAuth not working**
- Verify callback URLs match exactly
- Check credentials are correct in `.env`

**Email not sending**
- Verify SMTP credentials
- For Gmail, use App Password, not regular password
- Check spam folder

For detailed setup instructions, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)

## Need Help?

- NextAuth.js Docs: https://next-auth.js.org/
- Prisma Docs: https://www.prisma.io/docs
- Supabase (Free DB): https://supabase.com

