# AI Governance System

Enterprise AI System Intake Form for Governance Assessment. Built with Next.js 14, TypeScript, PostgreSQL, and NextAuth.js.

## Features

- User authentication (signup, login, protected routes)
- AI System Intake Form with 5 sections:
  1. Basic Information
  2. Human Oversight
  3. Data & Privacy
  4. Ownership & Accountability
  5. Compliance & Monitoring
- Auto-save functionality for draft submissions
- Dashboard to manage submissions
- Form validation with Zod
- PostgreSQL database with Prisma ORM

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-governance-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate a secure secret (`openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for local dev)

4. Push database schema:
```bash
npm run db:push
```

5. Seed the database (optional):
```bash
npx prisma db seed
```

This creates a demo user (demo@example.com / password123).

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Render

### Environment Variables

Set these in your Render dashboard:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=<generated-secret>
```

### Build & Start Commands

- Build: `npm install && npx prisma generate && npx prisma db push && npm run build`
- Start: `npm start`

## Project Structure

```
ai-governance-system/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── intake/        # Intake form pages
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Header, Footer
│   │   └── intake-form/   # Form components
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities, validations
└── package.json
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **Database**: PostgreSQL + Prisma
- **Authentication**: NextAuth.js

## License

MIT
