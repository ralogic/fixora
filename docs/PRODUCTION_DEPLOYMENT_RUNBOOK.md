# Fixora Production Deployment Runbook

## 1. Credential Rotation and Secret Hygiene

1. Rotate leaked credentials at the provider level immediately:
   - Database users/passwords
   - Stripe keys and webhook secret
   - Google Maps API key restrictions
   - OTP email provider API key
2. Replace secrets in deployment platform secret managers only (never in repo).
3. Keep `.env.example` placeholders only.

## 2. Service Topology

Deploy as separate services:

1. Web/API service (Next.js)
   - Host: Vercel, Render, Railway, ECS, or Kubernetes
   - Expose HTTPS only
2. Realtime gateway service (`scripts/socket-server.mjs`)
   - Host: ECS/Fargate, DigitalOcean App Platform, Render, Railway
   - Restrict origin with `ALLOWED_ORIGINS`
   - Require `SOCKET_AUTH_TOKEN` in production
3. Managed PostgreSQL
   - Supabase/Neon/RDS
4. Optional Redis service
   - For distributed rate limiting and queues

## 3. Mandatory Environment Variables

- DATABASE_URL
- DIRECT_URL
- AUTH_JWT_SECRET
- OTP_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- NEXT_PUBLIC_SOCKET_URL
- SOCKET_PORT
- SOCKET_AUTH_TOKEN
- ALLOWED_ORIGINS
- EMAIL_OTP_API_URL
- EMAIL_OTP_API_KEY
- EMAIL_OTP_FROM_EMAIL
- EMAIL_OTP_FROM_NAME

## 4. Database Migration Baseline

1. Generate Prisma client
2. Apply migration history in order
3. Verify new models exist:
   - Notification
   - PasswordResetToken
   - AssignmentAttempt
   - Dispute
   - AuditLog
4. Run seed only in non-production environments

## 5. Security Controls

1. Verify RBAC is enforced for customer/technician/admin APIs.
2. Verify ownership checks derive IDs from authenticated session.
3. Verify OTP is hashed and lockout is active after 3 failures.
4. Verify rate limiting is enabled for auth endpoints.
5. Verify security headers are present on responses.
6. Verify Stripe fallback mode is disabled in production.

## 6. Smoke Test Suite (Post Deploy)

1. Health endpoints:
   - GET /api/health returns 200
   - GET /api/ready returns 200
2. Auth:
   - OTP send and verify
   - Password login
   - Forgot-password request and confirm
3. Booking:
   - Create booking
   - Technician accept
   - Status progression
   - Cancellation rules
4. Payments:
   - Create intent
   - Webhook success path
   - Payment history endpoint
5. Admin:
   - Pending technician list
   - Approve/reject technician
   - Reassign booking
   - Disputes CRUD flow

## 7. Rollback Procedure

1. Freeze deploys.
2. Revert to previous stable app image/build.
3. Roll back database only if migration is backward compatible and tested.
4. Repoint traffic to previous socket service revision.
5. Validate /api/health and critical booking/payment flows.

## 8. Incident Drill Checklist

1. Simulate OTP provider outage and verify graceful API error handling.
2. Simulate database latency and verify readiness fails fast.
3. Simulate Stripe webhook delay and verify idempotent recovery.
4. Simulate socket gateway downtime and verify app fallback behavior.
5. Record mean-time-to-detect and mean-time-to-recover.

## 9. Operational Monitoring

Track:

- otp_send_success_rate
- otp_verify_failure_rate
- login_failure_rate
- booking_create_error_rate
- assignment_failure_rate
- payment_webhook_processing_time
- api_5xx_rate

Route logs and errors to centralized observability stack (Sentry/OpenTelemetry/Datadog).
