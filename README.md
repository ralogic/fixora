# Fixora - 30-Minute Home Repair Platform

Production-grade full-stack starter for on-demand home repair services in Jaipur, built with Next.js App Router, Prisma + PostgreSQL (Supabase), Socket.io, and Stripe.

## Stack
- Frontend: Next.js 16, React 19, TailwindCSS, Framer Motion
- Backend: Next.js API routes + standalone Socket.io gateway
- Database: PostgreSQL (Supabase) + Prisma ORM
- Payments: Stripe payment intents + webhook handling
- Maps: Google Maps client loader
- State: Zustand + typed service clients

## Features Implemented
- Premium animated customer homepage with mobile-first UX
- Multi-step booking flow with real API call to create orders
- Live tracking page with socket room subscription
- Customer order history page
- Technician dashboard with online/offline, offer timer, and job progression
- Admin dashboard with operations tables, KPIs, and analytics sections
- Dispatch-oriented booking API with ranking logic (distance + quality)
- Technician discovery endpoint with ranking and ETA
- Orders APIs for history and detail
- Stripe payment intent creation and webhook processing
- Prisma schema covering users, technicians, services, orders, locations, payments, ratings, zones
- Seed script with Jaipur city, zones, services, customer, admin, and technicians
- Standalone Socket.io realtime server script

## Project Structure
- src/app: customer/admin/technician routes and API handlers
- src/components: UI, booking, tracking, motion, layout components
- src/lib: prisma, stripe, validation, constants, utility modules
- src/services: api client, socket client, maps client
- src/state: booking flow state module
- prisma: schema + seed
- scripts: socket gateway

## Quick Start
1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Push schema to PostgreSQL and seed data

```bash
npm run prisma:push
npm run prisma:seed
```

4. Start web app and socket gateway in separate terminals

```bash
npm run dev
npm run socket:dev
```

5. Open the app
- Customer web: http://localhost:3000
- Book flow: http://localhost:3000/book
- Technician: http://localhost:3000/technician
- Admin: http://localhost:3000/admin

## Useful Scripts
- npm run dev
- npm run build
- npm run lint
- npm run prisma:generate
- npm run prisma:migrate
- npm run prisma:push
- npm run prisma:seed
- npm run prisma:studio
- npm run socket:dev

## API Endpoints
- POST /api/book-service
- GET /api/technicians?city=jaipur&serviceId=<id>&lat=<lat>&lng=<lng>
- GET /api/orders?customerId=<customer-id>
- GET /api/orders/:id
- POST /api/orders/:id/accept
- POST /api/payments/create-intent
- POST /api/payments/webhook
- GET /api/socket

## Deployment Notes
- Frontend + API routes: Vercel
- Realtime gateway: DigitalOcean droplet or AWS ECS/Fargate
- Database: Supabase PostgreSQL
- For production, run socket gateway behind Nginx and set ALLOWED_ORIGINS.
- Configure SOCKET_AUTH_TOKEN and NEXT_PUBLIC_SOCKET_AUTH_TOKEN for authenticated realtime connections.
- Use separate secrets for DATABASE_URL, DIRECT_URL, AUTH_JWT_SECRET, OTP_SECRET, Stripe, Maps, and email provider credentials.
- Apply Prisma migrations before switching live traffic.
- Verify /api/health and /api/ready before marking rollout successful.

## Production Hardening
- RBAC enforced for customer, technician, and admin protected APIs
- OTP hashing with lockout windows and rate limiting on auth endpoints
- Password reset request/confirm APIs and email templates
- Notification persistence, payment history, invoice, admin bookings/users/disputes APIs
- Security headers, same-origin checks, structured logging, audit logging, and readiness endpoints

See [docs/PRODUCTION_DEPLOYMENT_RUNBOOK.md](docs/PRODUCTION_DEPLOYMENT_RUNBOOK.md) for rollout, rollback, smoke-test, and incident drill steps.

## Seeded Demo IDs
- Customer: demo_customer_jaipur
- Admin: admin_fixora_jaipur
- Services: svc_electrician, svc_plumber, svc_ac_repair, svc_appliance

## Status
- Lint: passing
- Build: passing
- App routes generated successfully

## Implementation Package
- [Implementation index](docs/IMPLEMENTATION_PACKAGE.md)
- [API contract](docs/API_CONTRACT.md)
- [Platform architecture](docs/FIXORA_PLATFORM_ARCHITECTURE.md)
- [Prisma schema v2 draft](prisma/schema.v2-draft.prisma)
