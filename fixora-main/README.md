# Fixora Main

Production-focused rewrite of Fixora as an Urban Company-like home service marketplace.

## What Was Audited and Improved

- Replaced boilerplate Next.js app with a role-driven marketplace structure.
- Added secure API foundation with JWT sessions, OTP verification flow, RBAC, and rate limiting.
- Built normalized Prisma schema for customer, technician, admin, bookings, reviews, payments, chat, notifications, and OTP lifecycle.
- Added customer, technician, and admin dashboards and booking pages.
- Added API modules for auth, booking, technician discovery/onboarding, payments, reviews, chat, notifications, and admin approval.
- Added deployment-ready env template and middleware security headers.

## Tech Stack

- Frontend: Next.js App Router, React, Tailwind CSS, ShadCN-style component primitives
- Backend: Next.js Route Handlers
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT + OTP
- Maps: Google Maps API ready integration point

## Folder Structure

- src/app
- src/app/auth
- src/app/customer
- src/app/technician
- src/app/admin
- src/app/api/auth
- src/app/api/booking
- src/app/api/technician
- src/app/api/payments
- src/app/api/reviews
- src/app/api/messages
- src/components/ui
- src/components/booking
- src/components/map
- src/components/chat
- src/lib/db
- src/lib/auth
- src/lib/security
- src/lib/validation
- prisma

## Core Features Implemented

- OTP authentication endpoints (`send-otp`, `verify-otp`) with throttling
- Email/password login with JWT cookie session
- Customer booking creation and list retrieval
- Booking status update flow for customer/technician/admin
- Nearby technician discovery by distance and category
- Technician onboarding endpoint
- Payment record upsert endpoint
- Review submission with technician rating recalculation
- Booking chat messages API
- Notifications API
- Admin technician approval API

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Setup environment variables

```bash
cp .env.example .env
```

3. Generate Prisma client and apply schema

```bash
npm run prisma:generate
npm run prisma:push
```

4. Seed demo data

```bash
npm run prisma:seed
```

5. Run app

```bash
npm run dev
```

## Deployment Guide

1. Setup PostgreSQL
- Create a PostgreSQL database on Railway, Supabase, Neon, or VPS.
- Set `DATABASE_URL` and `DIRECT_URL`.

2. Run Prisma migrations

```bash
npm run prisma:migrate
```

3. Configure environment variables
- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- OTP email provider keys (optional)

4. Deploy Next.js to Vercel
- Import repository in Vercel.
- Add all env vars in Vercel project settings.
- Deploy.

5. Connect Google Maps API
- Enable Maps JavaScript + Places APIs.
- Restrict key by domain.
- Add to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

## Suggested Next Improvements

- Replace in-memory rate limiter with Redis-based distributed limiter.
- Add background queue for notifications and OTP delivery.
- Use WebSocket/SSE broker for true real-time booking and location updates.
- Add Stripe webhook verification and idempotency keys.
- Add observability (OpenTelemetry + structured logs + alerts).
- Add E2E tests for booking lifecycle and RBAC policies.
