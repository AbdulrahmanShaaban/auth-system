# Capsule Corp — Auth Starter 🚀

A full-stack authentication starter built with the MERN stack and Next.js App Router.

## Live Demo
- **Frontend:** https://auth-system-sage.vercel.app
- **Backend:** https://auth-system-backend-blond.vercel.app

## Features
- Register / Login / Logout
- JWT stored in HTTP-only cookies
- Protected routes via Next.js middleware
- Auth state managed with Zustand
- Form validation with React Hook Form + Zod

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- Axios
- Google Stitch (UI Design)

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT + HTTP-only cookies
- bcryptjs

## Project Structure
auth-system/
├── frontend/     → Next.js App
└── backend/      → Express API

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create new user |
| POST | /api/auth/login | Login + set cookie |
| POST | /api/auth/logout | Clear cookie |
| GET | /api/auth/me | Get current user |

## Getting Started

### Backend
```bash
cd backend
pnpm install
pnpm run dev
```

### Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```

### Environment Variables

**Backend `.env`:**
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000

**Frontend `.env.local`:**
NEXT_PUBLIC_API_URL=http://localhost:5000
