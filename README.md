# Cognisys AI Resume Builder

A modern, full-featured resume builder application built with Next.js 15, featuring OAuth authentication, cloud storage, and AI-powered content generation.

## 🚀 Features

- **Multi-Authentication Support**
  - Google OAuth
  - GitHub OAuth  
  - Email/Password with OTP verification
  
- **Cloud Storage**
  - MongoDB Atlas integration
  - Auto-save functionality
  - Cross-device synchronization
  
- **Resume Builder**
  - Multi-step form interface
  - Live preview
  - PDF download
  - AI-powered content generation (with Google AI API)
  
- **Modern UI**
  - Responsive design
  - Dark mode support
  - Professional styling with Tailwind CSS
  - shadcn/ui components

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Google Cloud Console account (for OAuth)
- GitHub OAuth App (optional)
- Google AI API key (for AI features)

## 🛠️ Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Resume-Builder-2
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/resumebuilder?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Email (Gmail SMTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@resumebuilder.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to MongoDB
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md)** - Authentication setup guide
- **[MONGODB_SETUP.md](MONGODB_SETUP.md)** - MongoDB configuration guide

## 🔐 Authentication Flow

1. User visits any page → Redirected to `/login`
2. Login with Google/GitHub/Email → Redirected to `/` (homepage)
3. Configure API key (optional) → Navigate to `/build`
4. Build resume with auto-save to MongoDB

## 🎨 Tech Stack

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Authentication:** NextAuth.js
- **Database:** MongoDB Atlas, Prisma ORM
- **Email:** Nodemailer (Gmail SMTP)
- **AI:** Google Generative AI

## 📁 Project Structure

```
Resume-Builder-2/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and configurations
│   └── types/            # TypeScript type definitions
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── middleware.ts         # Authentication middleware
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

## 🌟 Key Features

### Auto-Save
- Saves automatically when navigating between form sections
- Saves on browser close/tab close
- Saves on logout

### Progressive Form
- Multi-step form with validation
- Live preview updates
- Step navigation with data persistence

### PDF Generation
- Print-optimized layout
- Contact information header
- Professional formatting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
