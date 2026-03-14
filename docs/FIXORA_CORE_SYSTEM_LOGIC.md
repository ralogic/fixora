# Fixora Core System Logic (Next.js)

This document defines the scalable core logic for authentication, booking, technician assignment, and notifications for Fixora.

## 1) Architecture Blueprint

- Frontend: Next.js App Router (customer, technician, admin dashboards)
- API layer: Next.js route handlers under `src/app/api`
- Domain layer: `src/server/modules/*` (auth, bookings, technicians, notifications, admin)
- Persistence: Prisma + PostgreSQL
- Realtime: Socket.io gateway (`scripts/socket-server.mjs`) + event bus abstraction
- Async jobs: queue worker for email + fallback assignment retries

### Recommended domain modules

- `src/server/modules/auth`
- `src/server/modules/bookings`
- `src/server/modules/dispatch`
- `src/server/modules/technicians`
- `src/server/modules/notifications`
- `src/server/modules/admin`
- `src/server/modules/security`

Keep API handlers thin: validate input, call module, map errors to HTTP.

## 2) Roles and Access Rules

- Customer: create/track/cancel bookings, manage profile
- Technician: receive offers, accept/decline, update status
- Admin: approve technicians, monitor dispatch failures, force reassign

Authorization guards:

- Customer routes: role = CUSTOMER
- Technician routes: role = TECHNICIAN and technician.verificationStatus = VERIFIED
- Admin routes: role = ADMIN

## 3) Data Model (Core)

Existing schema already contains `User`, `Technician`, `Order`, `OrderEvent`, `OtpCode`.
Add/adjust the following for requested behavior.

### 3.1 OTP model

Current `OtpCode.phone` is reused for email. Replace with explicit identifier fields.

```prisma
model OtpCode {
  id           String   @id @default(cuid())
  identifier   String   // email for this flow
  channel      String   // EMAIL
  purpose      String   // CUSTOMER_BOOKING_VERIFY | TECHNICIAN_REGISTER_VERIFY
  codeHash     String   // store hash, not plaintext
  expiresAt    DateTime
  attempts     Int      @default(0)
  maxAttempts  Int      @default(3)
  verifiedAt   DateTime?
  consumedAt   DateTime?
  createdAt    DateTime @default(now())

  @@index([identifier, purpose, createdAt])
  @@index([expiresAt])
}
```

### 3.2 Notification model

```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // BOOKING_CONFIRMED, NEW_JOB_REQUEST, etc.
  title       String
  message     String
  status      String   @default("UNREAD") // UNREAD | READ
  channel     String   // IN_APP | EMAIL | SMS
  payloadJson Json?
  createdAt   DateTime @default(now())
  readAt      DateTime?

  @@index([userId, createdAt])
  @@index([status])
}
```

### 3.3 Assignment tracking model

```prisma
model AssignmentAttempt {
  id             String   @id @default(cuid())
  orderId        String
  order          Order    @relation(fields: [orderId], references: [id])
  technicianId   String
  offeredAt      DateTime @default(now())
  respondedAt    DateTime?
  response       String?  // ACCEPTED | DECLINED | TIMEOUT
  reason         String?  // optional decline reason

  @@index([orderId, offeredAt])
  @@index([technicianId, offeredAt])
}
```

### 3.4 Booking status normalization

Requested lifecycle:

- `PENDING`
- `TECHNICIAN_ASSIGNED`
- `ACCEPTED`
- `ON_THE_WAY`
- `WORK_STARTED`
- `WORK_COMPLETED`
- `PAYMENT_DONE`
- `CANCELED`

If preserving existing enum, map like:

- ASSIGNED -> TECHNICIAN_ASSIGNED/ACCEPTED split (recommended to separate)
- IN_PROGRESS -> WORK_STARTED
- COMPLETED + payment success -> PAYMENT_DONE

## 4) Authentication and Account Flows

## 4.1 Customer first visit (Book a Service + email OTP)

1. Customer submits booking form with required fields.
2. System calls `POST /api/auth/send-otp` with purpose `CUSTOMER_BOOKING_VERIFY`.
3. Generate 6-digit OTP, hash it, persist with 5-minute expiry and maxAttempts=3.
4. Send OTP via email provider (Resend/SendGrid/SMTP).
5. Customer submits OTP to `POST /api/auth/verify-otp`.
6. If verified:
   - Upsert customer by email.
   - If new user, generate secure random password (16+ chars), hash with bcrypt/argon2.
   - Send account credentials email.
   - Continue booking creation transaction.

Transaction boundary (important):

- Verify OTP
- Create customer (if new)
- Create booking
- Create order event
- Queue notifications

All above should succeed/fail atomically where possible.

## 4.2 Customer returning login

- Endpoint: `POST /api/auth/login`
- Credentials: email + password only
- No OTP for login
- Issue httpOnly signed session token/JWT cookie

Post-login capabilities:

- `GET /api/orders?scope=current`
- `GET /api/orders?scope=history`
- `GET /api/orders/:id` (timeline + technician status)
- `POST /api/orders/:id/cancel`
- `PATCH /api/customers/me`
- `POST /api/auth/reset-password/request` and `/confirm`

## 4.3 Technician first registration

1. Submit registration (personal + professional + documents).
2. Verify email OTP (purpose `TECHNICIAN_REGISTER_VERIFY`).
3. Create user(role=TECHNICIAN) + technician profile.
4. Generate random password, hash and store.
5. Send credentials email.
6. Set `verificationStatus = PENDING`.
7. Notify admins: `NEW_TECHNICIAN_REGISTRATION`.

Technician cannot receive jobs until admin approval.

## 4.4 Technician returning login

- Same login endpoint, email + password only
- If status != VERIFIED, allow dashboard access but hide/disable job queue actions

## 5) Booking and Assignment Logic

## 5.1 Create booking

Endpoint: `POST /api/book-service`

Input fields:

- Name
- Mobile Number
- Email
- Service Type
- Address/Location
- Preferred Date & Time
- Problem Description

Server steps:

1. Validate schema (zod).
2. Resolve city/service/zone.
3. Create booking (`PENDING`) and location record.
4. Run matching query for technicians by:
   - service category mapping
   - distance <= service radius
   - verified + online + available slot
5. Dispatch path:
   - Auto assign: pick top-ranked technician.
   - Manual selection: customer picks from ranked list.

Ranking example:

score =
  (distanceWeight * normalizedDistance)
+ (ratingWeight * normalizedRating)
+ (acceptanceWeight * acceptanceRate)
+ (workloadWeight * inverseActiveJobs)

## 5.2 Auto assign flow

1. Set booking `TECHNICIAN_ASSIGNED` and attach technicianId.
2. Create `AssignmentAttempt` record.
3. Push realtime notification to `technician:{id}`.
4. Start offer timeout (for example 90 seconds).
5. If no response in timeout -> mark attempt TIMEOUT -> try next candidate.
6. If no candidates left -> mark as failed assignment and notify admin.

## 5.3 Manual selection flow

1. Customer selects technician from available list.
2. Validate technician eligibility at selection time.
3. Lock assignment row (transaction or optimistic version check).
4. Create assignment attempt and notify selected technician.

## 6) Technician Job Notification and Actions

Realtime payload for new offer:

```json
{
  "type": "NEW_JOB_REQUEST",
  "bookingId": "ord_x",
  "customerName": "Aditi Jain",
  "serviceType": "Electrician",
  "location": "Vaishali Nagar, Jaipur",
  "description": "Ceiling fan stopped",
  "scheduledTime": "2026-03-16T10:00:00.000Z",
  "expiresInSec": 90
}
```

Technician dashboard buttons:

- ACCEPT JOB
- HELP WITH THIS WORK

## 6.1 Accept job

Endpoint: `POST /api/orders/:id/accept`

Rules:

- Technician must be currently assigned candidate
- Prevent double-accept race with transaction and conditional update

On success:

- booking status -> `ACCEPTED`
- set assigned timestamps
- notify customer: technician assigned + contact + ETA
- emit socket updates to order room and customer dashboard

## 6.2 Help with this work (decline)

Endpoint: `POST /api/orders/:id/decline`

On decline:

- update `AssignmentAttempt.response = DECLINED`
- append order event
- notify admin (`TECHNICIAN_DECLINED_JOB`)
- trigger reassignment to next ranked technician

If reassignment fails:

- notify admin (`FAILED_ASSIGNMENT`)
- booking remains in `PENDING` or `PENDING_ASSIGNMENT` with alert flag

## 7) Booking Status State Machine

Allowed transitions:

- `PENDING` -> `TECHNICIAN_ASSIGNED`
- `TECHNICIAN_ASSIGNED` -> `ACCEPTED`
- `TECHNICIAN_ASSIGNED` -> `PENDING` (on decline/timeout/reassign)
- `ACCEPTED` -> `ON_THE_WAY`
- `ON_THE_WAY` -> `WORK_STARTED`
- `WORK_STARTED` -> `WORK_COMPLETED`
- `WORK_COMPLETED` -> `PAYMENT_DONE`
- any pre-completion state -> `CANCELED` (policy-based)

Persist every transition in `OrderEvent` for audit and timeline rendering.

## 8) Notification Matrix

Customer notifications:

- Booking confirmed
- Technician assigned
- Technician accepted
- Technician on the way
- Work completed

Technician notifications:

- New job request
- Job cancellation
- Reassignment/new offer

Admin notifications:

- Technician declined job
- New technician registration
- Failed assignments

Delivery channels:

- In-app (Notification table + websocket)
- Email (critical events)

Pattern:

1. Write domain event (`OrderEvent`)
2. Notification service consumes event
3. Persist Notification rows
4. Push socket event + queue email

## 9) API Route Design (Next.js)

Auth:

- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/reset-password/request`
- `POST /api/auth/reset-password/confirm`

Booking:

- `POST /api/book-service`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders/:id/cancel`
- `POST /api/orders/:id/reassign` (admin/system)

Technician actions:

- `POST /api/orders/:id/accept`
- `POST /api/orders/:id/decline`
- `POST /api/orders/:id/status` (on_the_way, work_started, work_completed)

Admin:

- `GET /api/technicians/pending`
- `POST /api/technicians/:id/approve`
- `POST /api/technicians/:id/reject`
- `GET /api/admin/alerts`

Notifications:

- `GET /api/notifications`
- `POST /api/notifications/:id/read`

## 10) State Management (Frontend)

Use split stores for predictable scaling:

- `authStore`: user session, role, approval status
- `bookingStore`: form data, OTP state, selected technician, submit progress
- `ordersStore`: current jobs, history, timeline cache
- `notificationsStore`: unread list, realtime merges
- `technicianJobsStore`: incoming offers, active jobs, status actions

Realtime integration:

- join rooms after login (`user:{id}`, `technician:{id}`, `order:{orderId}`)
- reconcile socket events with API-fetched truth (eventual consistency)
- optimistic UI only for status actions that are idempotent

## 11) Security Rules

- OTP required only for:
  - first customer booking email verification
  - technician registration
- Login always email + password
- Passwords hashed using bcrypt(12+) or Argon2id
- OTP stored as hash, never plain text
- Rate limits:
  - send OTP: max 3 per 10 minutes per identifier + IP/device limits
  - verify OTP: max 3 attempts per OTP record
  - login brute-force protection per email/IP
- Use httpOnly, secure, sameSite cookies for sessions
- Sensitive APIs require RBAC and ownership checks
- File uploads scanned/validated and size-limited

## 12) Reliability and Observability

- Idempotency key for booking create endpoint
- Outbox/event table pattern for guaranteed notification delivery
- Retry queue for email and failed assignment attempts
- Metrics:
  - otp_send_success_rate
  - otp_verify_failure_rate
  - assignment_time_seconds
  - assignment_failure_rate
  - technician_acceptance_rate
- Structured audit events in `OrderEvent`

## 13) Minimal Implementation Sequence

1. Add `Notification` + `AssignmentAttempt` models and migrate.
2. Refactor OTP model to identifier/purpose/codeHash/maxAttempts=3.
3. Build auth module use-cases:
   - sendOtp
   - verifyOtpAndProvisionUser
   - loginWithPassword
4. Build dispatch module:
   - rankCandidates
   - assignTechnician
   - declineAndReassign
5. Add notification service (in-app + email).
6. Wire socket emissions from domain events.
7. Implement status state machine guards.
8. Add integration tests for OTP, booking creation, accept/decline/reassign.

This design satisfies the required customer and technician onboarding, non-OTP login policy, assignment/reassignment logic, booking lifecycle, and role-based notification delivery while remaining aligned with the current Fixora codebase structure.
