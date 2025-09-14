# TrackVerse Waitlist

A modern, Robinhood-style waitlist page for the TrackVerse track and field social platform.

## Features

- 🎯 Beautiful gradient UI with glassmorphism effects
- 📧 Email signup with validation
- 🔗 Referral system with unique codes
- 📊 Real-time waitlist positioning
- 🏆 Ranked competition tiers showcase
- 🪙 Track Coin betting system preview
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Deployment**: Vercel (recommended)

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations: `npx prisma db push`
5. Start development server: `npm run dev`

## Production Deployment

See deployment instructions below for Supabase + Vercel setup.
