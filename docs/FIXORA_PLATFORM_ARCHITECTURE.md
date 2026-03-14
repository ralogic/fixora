# Fixora Platform Architecture

Fixora is a marketplace platform for on-demand local home services. It connects customers with verified nearby technicians for categories such as electrician, plumber, AC repair, mobile repair, carpenter, and appliance repair. The product should feel like Urban Company for service quality, Uber for dispatch visibility, and a modern startup product for interface quality.

## 1. Platform Roles

### Customer

What the customer can see:

- Service categories with pricing and ETA
- Nearby technician listings and profile pages
- Booking form and price breakdown
- Booking timeline and live map tracking
- Saved technicians, payment history, reviews, and support

What the customer can do:

- Register and log in using phone OTP, email/password, or Google
- Search and filter services and technicians
- Create, cancel, reschedule, and track bookings
- Chat, call, pay, and rate technicians
- Save favorite technicians and addresses

### Technician

What the technician can see:

- Onboarding progress and verification status
- New job requests and active jobs
- Daily schedule, earnings, ratings, and payout history
- Service area, availability, performance stats, and support alerts

What the technician can do:

- Register through a five-step onboarding flow
- Upload documents and complete KYC
- Accept or reject jobs
- Update job status from accepted to completed
- Manage profile, categories, working radius, skills, and availability
- View navigation and payout information

### Admin

What the admin can see:

- Full platform metrics: users, technicians, bookings, revenue, disputes
- Pending technician applications and KYC documents
- Booking operations, service quality, and incident reports
- Finance dashboards and top-performing technicians

What the admin can do:

- Approve, reject, suspend, and reactivate technicians
- Override bookings, reassign jobs, issue refunds, and resolve disputes
- Configure service categories, pricing rules, commissions, and cities
- Review fraud signals, abuse reports, and failed payouts
- Manage CMS content, notifications, promo campaigns, and analytics exports

## 2. Product Navigation Map

### Customer surface

- `/`
  Marketing landing page with category discovery and CTA
- `/auth/login`
  Phone OTP, email/password, Google login
- `/auth/register`
  Customer sign-up
- `/book`
  Multi-step service booking flow
- `/services/[category]`
  Service category landing page
- `/technicians`
  Technician listing with search + filters
- `/technicians/[id]`
  Technician profile page
- `/track/[bookingId]`
  Live booking status and map tracking
- `/customer/dashboard`
  Upcoming bookings, history, saved technicians, reviews, payments
- `/customer/payments`
  Payment methods and receipts
- `/customer/support`
  Support, disputes, refund requests

### Technician surface

- `/join`
  Become Technician onboarding flow
- `/technician`
  Technician dashboard
- `/technician/jobs`
  New requests, active jobs, completed jobs
- `/technician/jobs/[id]`
  Job detail, customer contact, maps navigation
- `/technician/earnings`
  Earnings analytics and payout history
- `/technician/profile`
  Skills, documents, availability, hours, service radius
- `/technician/support`
  Help center, disputes, document re-upload

### Admin surface

- `/admin`
  KPI dashboard and operational control center
- `/admin/technicians`
  Technician roster, approvals, suspensions
- `/admin/verifications`
  Pending KYC reviews and document decisions
- `/admin/bookings`
  Booking lifecycle management and reassignments
- `/admin/payments`
  Revenue, settlements, refunds, failed payments
- `/admin/disputes`
  Complaints, chargebacks, technician issues
- `/admin/analytics`
  Geography, category, SLA, conversion, retention
- `/admin/settings`
  Categories, pricing, zones, commissions, notifications

## 3. Customer Experience Design

### Registration and Login

Supported methods:

- Phone OTP
- Email + password
- Google login

Recommended UX:

- Single auth shell with tabbed login methods
- OTP auto-read on mobile where supported
- Progressive profile completion after quick login
- Device/session listing for account security

Key backend rules:

- Rate-limit OTP requests per phone, IP, and device fingerprint
- Passwords hashed using bcrypt or Argon2
- OAuth accounts linked to existing phone/email identity after verification

### Customer Home Page

Sections:

- Hero with search bar and quick service chips
- Top service categories grid
- Trust strip: verified pros, 30-minute dispatch, transparent pricing
- Popular technicians carousel
- How it works timeline
- Reviews and service coverage

Each category card should show:

- Icon
- Category title
- One-line description
- Starting price
- Estimated arrival time

### Technician Listing Page

Core layout:

- Sticky filter bar on top
- Two-column desktop layout: results + optional map
- Single-column swipe-friendly cards on mobile

Each technician card should display:

- Profile photo
- Name
- Service category
- Experience in years
- Rating with stars
- Completed jobs
- Distance from customer
- Availability badge
- Book Now CTA

Filters:

- Price range
- Rating
- Distance
- Experience
- Availability
- Service type
- Response time

Sorting:

- Recommended
- Nearest
- Highest rated
- Lowest price
- Fastest arrival

### Technician Profile Page

Content blocks:

- Hero card with profile photo, name, rating, completed jobs, verified badge
- About section
- Skills and certifications
- Service area and city coverage
- Gallery / before-after work photos
- Reviews summary and review list
- Starting price and dynamic estimate hint
- Sticky Book Technician button on mobile

### Book Technician Page

Booking form fields:

- Customer name
- Phone number
- Address
- City
- Pin code
- Service category
- Problem description
- Upload problem photos
- Preferred date
- Preferred time slot

Supplementary UX:

- Auto-fill saved customer profile and saved addresses
- Service fee breakdown card
- Dynamic price estimate based on category, city, urgency, and service radius
- Sticky confirm booking CTA on mobile

Price summary should show:

- Estimated service price
- Platform service fee
- Convenience / urgency fee if any
- Tax
- Total cost

### Booking Status Tracking

Statuses:

- Pending
- Accepted
- Technician on the way
- Work started
- Completed
- Cancelled

Tracking page modules:

- Status timeline
- Technician mini-profile
- OTP / PIN for work start confirmation
- Google Maps live tracking
- Call and chat actions
- Price summary and invoice link

### Customer Dashboard

Widgets:

- Upcoming bookings
- Booking history
- Saved technicians
- Payments and invoices
- Reviews written / pending

Customer actions:

- Cancel booking
- Reschedule booking
- Rate technician
- Chat with technician
- Call technician
- Download invoice
- Raise support ticket

## 4. Technician Experience Design

### Become Technician Page

Multi-step onboarding:

1. Personal information
   Full name, phone, email, password, city, area
2. Professional details
   Service category, skills, years of experience, tools availability, work type
3. Document verification
   Aadhaar, PAN, profile photo, certificates
4. Service area
   City, service radius, Google Maps location pin
5. Payment details
   Bank account name, bank name, account number, IFSC, UPI ID

UX rules:

- Save draft between steps
- File upload preview and size/type validation
- Inline validation and progress indicator
- Explain approval SLA and next steps clearly

### Technician Approval System

Lifecycle:

1. Technician submits onboarding form
2. Technician profile created with `verification_status = pending`
3. Admin reviews profile, documents, service category fit, and city
4. Admin approves or rejects with reason
5. Only approved technicians become searchable and can receive jobs

Statuses:

- Pending
- Approved
- Rejected
- Suspended

### Technician Dashboard

Modules:

- New job requests
- Today's bookings
- Completed jobs
- Total earnings
- Ratings snapshot
- Verification / compliance alerts
- Availability toggle

### Job Request Screen

Technician sees:

- Customer name
- Service type
- Problem description
- Address
- Distance
- Estimated price
- Booking time

Actions:

- Accept
- Reject

Advanced behavior:

- Offer timeout countdown
- Auto-expire and reassign if no response
- Fraud and distance warnings if required

### Job Execution Flow

Status transitions:

- Accepted
- On the way
- Work started
- Completed

Optional additions:

- Arrived
- Waiting for customer
- Cannot complete

Execution tools:

- Open Google Maps navigation
- Start-work OTP verification from customer
- Upload before / after photos
- Add material cost or extra work quote
- Mark complete and trigger payment/invoice

### Technician Earnings

Views:

- Daily earnings
- Weekly earnings
- Monthly earnings
- Total lifetime earnings
- Payout history
- Commission deductions

Metrics:

- Gross earnings
- Platform fee
- Incentives / bonuses
- Net payable
- Pending payout

### Technician Profile Management

Editable fields:

- Skills
- Experience
- Profile photo
- Service categories
- Working hours
- Online / offline availability
- Service radius
- Bio and languages

Restricted edits requiring review:

- PAN / Aadhaar change
- Name change
- City relocation if compliance rules apply

## 5. Admin System Design

### Admin Dashboard

Top statistics:

- Total users
- Total technicians
- Total bookings
- Total revenue
- Top technicians
- Booking conversion rate
- Average dispatch time
- Cancellation rate

Operational modules:

- Pending technician approvals
- Active bookings board
- Dispute queue
- Failed payment and payout alerts
- Category demand heatmap

### Admin capabilities

- Approve technicians
- Reject technicians
- Suspend technicians
- Manage bookings
- Handle disputes
- View analytics
- Adjust pricing rules
- Manage service zones and city rollout
- Send announcements and promotional notifications

## 6. Core Workflows

### Customer booking workflow

1. Customer logs in
2. Selects service category
3. Searches technicians or chooses auto-assign
4. Enters issue details and preferred time
5. Receives estimated price
6. Confirms booking and payment intent
7. Technician receives offer
8. Technician accepts
9. Customer tracks technician live
10. Job starts and completes
11. Payment captured and invoice generated
12. Customer rates technician

### Technician onboarding workflow

1. Technician opens `/join`
2. Completes five-step onboarding
3. Uploads KYC and payout data
4. Receives pending verification state
5. Admin reviews application
6. Technician receives approval or rejection notification
7. Approved technician can go online and accept jobs

### Admin verification workflow

1. Admin opens pending verification queue
2. Reviews technician identity, services, city, and documents
3. Approves, rejects, or requests resubmission
4. System notifies technician
5. Search index updates for approved technicians

## 7. Database Design

Recommended engine:

- PostgreSQL for relational integrity, GIS-friendly querying, and analytics support

### Core tables

#### users

- id
- role enum: customer, technician, admin
- full_name
- phone
- email
- password_hash
- google_id
- avatar_url
- status enum: active, blocked, deleted
- created_at
- updated_at

#### customers

- user_id PK/FK -> users.id
- default_address_id FK -> addresses.id
- total_bookings
- lifetime_value
- last_login_at

#### technicians

- user_id PK/FK -> users.id
- verification_status enum: pending, approved, rejected, suspended
- primary_service_category_id FK -> service_categories.id
- bio
- experience_years
- tools_available boolean
- work_type enum: home_service, shop, both
- city_id FK -> cities.id
- area
- latitude
- longitude
- service_radius_km
- is_online boolean
- average_rating
- completed_jobs_count
- total_earnings
- working_hours_json
- rejection_reason
- approved_at
- approved_by FK -> admins.user_id

#### technician_documents

- id
- technician_id FK -> technicians.user_id
- document_type enum: aadhaar, pan, profile_photo, certificate
- file_url
- verification_status enum: pending, approved, rejected
- rejection_reason
- uploaded_at
- reviewed_at
- reviewed_by

#### service_categories

- id
- slug
- name
- icon_key
- description
- starting_price
- estimated_time_minutes
- is_active

#### technician_services

- id
- technician_id FK
- service_category_id FK
- base_price
- experience_label
- is_active

#### addresses

- id
- user_id FK -> users.id
- label
- contact_name
- phone
- address_line_1
- address_line_2
- landmark
- city_id FK
- pin_code
- latitude
- longitude
- is_default

#### bookings

- id
- booking_code
- customer_id FK -> customers.user_id
- technician_id FK -> technicians.user_id nullable until assignment
- service_category_id FK
- address_id FK
- status enum: pending, accepted, on_the_way, work_started, completed, cancelled
- problem_description
- problem_photos_json
- preferred_date
- preferred_time_slot
- scheduled_at
- started_at
- completed_at
- estimated_price
- service_fee
- tax_amount
- total_cost
- final_amount
- cancel_reason
- created_at
- updated_at

#### booking_status_history

- id
- booking_id FK
- old_status
- new_status
- changed_by_user_id FK
- note
- created_at

#### reviews

- id
- booking_id FK unique
- customer_id FK
- technician_id FK
- rating
- review_text
- created_at

#### payments

- id
- booking_id FK
- customer_id FK
- technician_id FK nullable
- provider
- provider_payment_id
- amount
- currency
- payment_status enum: pending, authorized, captured, refunded, failed
- platform_fee
- technician_payout_amount
- paid_at
- refunded_at

#### notifications

- id
- user_id FK
- channel enum: push, sms, email, in_app, whatsapp
- template_key
- title
- body
- metadata_json
- read_at
- sent_at
- delivery_status

### Supporting tables

- cities
- service_zones
- otp_codes
- chat_threads
- chat_messages
- saved_technicians
- disputes
- payout_accounts
- payouts
- support_tickets
- admin_audit_logs

### Relationship summary

- One user can be one customer or one technician or one admin
- One technician can have many documents, services, reviews, bookings, payouts
- One customer can have many addresses, bookings, payments, reviews
- One booking belongs to one customer, one address, one service category, and optionally one technician until accepted
- One payment belongs to one booking
- One review belongs to one completed booking

## 8. Backend Architecture

Recommended backend stack:

- Node.js
- Express
- PostgreSQL
- Prisma or TypeORM
- Redis for OTP, caching, job offers, and queue state
- Socket.IO or WebSocket gateway for live tracking and status updates

### Suggested service boundaries

- Auth service
- User/Profile service
- Technician/KYC service
- Discovery/Search service
- Booking/Dispatch service
- Payments/Payouts service
- Notification service
- Admin/Analytics service

### Why Express here

- Clean REST API separation from frontend
- Easier scaling into mobile apps and third-party clients
- Better fit for background workers, dispatch logic, and queue processing

## 9. REST API Structure

### Auth

- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Customers

- `GET /api/v1/customers/me`
- `PATCH /api/v1/customers/me`
- `GET /api/v1/customers/bookings`
- `GET /api/v1/customers/saved-technicians`
- `POST /api/v1/customers/saved-technicians/:technicianId`

### Technicians

- `POST /api/v1/technicians/register`
- `GET /api/v1/technicians/search`
- `GET /api/v1/technicians/:id`
- `PATCH /api/v1/technicians/me`
- `PATCH /api/v1/technicians/me/availability`
- `GET /api/v1/technicians/me/jobs`
- `POST /api/v1/technicians/me/jobs/:bookingId/accept`
- `POST /api/v1/technicians/me/jobs/:bookingId/reject`
- `PATCH /api/v1/technicians/me/jobs/:bookingId/status`

### Bookings

- `POST /api/v1/bookings`
- `GET /api/v1/bookings/:id`
- `PATCH /api/v1/bookings/:id/cancel`
- `PATCH /api/v1/bookings/:id/reschedule`
- `GET /api/v1/bookings/:id/tracking`

### Reviews

- `POST /api/v1/reviews`
- `GET /api/v1/technicians/:id/reviews`

### Payments

- `POST /api/v1/payments/create-intent`
- `POST /api/v1/payments/webhook`
- `GET /api/v1/payments/:bookingId`

### Admin

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/technicians/pending`
- `PATCH /api/v1/admin/technicians/:id/approve`
- `PATCH /api/v1/admin/technicians/:id/reject`
- `PATCH /api/v1/admin/technicians/:id/suspend`
- `GET /api/v1/admin/bookings`
- `PATCH /api/v1/admin/bookings/:id/reassign`
- `GET /api/v1/admin/analytics`

## 10. Folder Structure

Recommended monorepo shape:

```text
fixora/
  apps/
    web/
      src/
        app/
        components/
        hooks/
        services/
        state/
        styles/
    api/
      src/
        modules/
          auth/
          customers/
          technicians/
          bookings/
          payments/
          reviews/
          notifications/
          admin/
        middleware/
        lib/
        workers/
  packages/
    ui/
    config/
    types/
    validation/
  prisma/
  docs/
```

### Current repo adaptation

For the existing Next.js codebase, keep this simpler structure:

- `src/app` for routes and page shells
- `src/components` for reusable UI
- `src/lib` for validation, db, auth, utils
- `src/services` for API clients, maps, sockets
- `src/state` for Zustand stores
- `prisma` for schema and seed
- `scripts` for socket and worker scripts

## 11. UI / UX Design Direction

Visual direction:

- Clean and minimal
- Mobile-first layouts
- Rounded cards and rounded inputs
- Soft shadows
- Gradient primary buttons
- Blue / cyan / emerald brand palette
- High-legibility typography with strong hierarchy

UI guidelines:

- Sticky CTA on booking and tracking flows
- Bottom sheets for mobile filters and location selection
- Swipeable technician cards on mobile
- Clear empty states and skeleton loaders
- Persistent status badges for availability and verification

Framer Motion usage:

- Page entrance transitions
- Card stagger on search results
- Modal and sheet spring animations
- Step transitions in onboarding and booking flows
- Subtle live-tracking pulse and route activity indicators

## 12. Mobile Experience

Must-have mobile behavior:

- Hamburger navigation
- Sticky bottom booking bar
- Touch-friendly card spacing and buttons
- Swipeable lists where useful
- Tap-to-call and tap-to-chat actions
- Bottom-sheet filters
- Optimized map interactions and reduced keyboard friction

## 13. Performance Strategy

- Lazy-load heavy maps, charts, and image galleries
- Use image optimization for technician photos and documents
- Cache public category and city metadata
- Paginate reviews and booking history
- Use geospatial indexes for nearby technician search
- Offload notifications and payouts to background workers
- Stream live status via websockets instead of polling where possible

## 14. Security and Compliance

- JWT or secure session cookies for auth
- OTP rate limiting and replay protection
- Encrypt sensitive financial fields at rest where required
- Signed URLs for document access
- Admin audit logging for approval and suspension actions
- Role-based access control for every API route
- PII minimization in analytics pipelines

## 15. Analytics and KPIs

Track:

- Service category conversion rate
- Search to booking conversion
- Technician acceptance rate
- Average dispatch time
- First response time
- Cancellation rate by stage
- Repeat customer rate
- Customer NPS / rating trends
- Revenue per city and category

## 16. Recommended Delivery Phases

### Phase 1: Marketplace core

- Customer auth
- Service discovery
- Technician listing/profile
- Booking creation
- Technician onboarding
- Admin verification

### Phase 2: Dispatch and trust

- Live tracking
- Chat/call flows
- Notifications
- Rating and reviews
- Saved technicians and addresses

### Phase 3: Monetization and operations

- Online payments
- Technician payouts
- Admin analytics
- Disputes and refunds
- Promotions and CRM

### Phase 4: Scale

- Multi-city rollout
- Dynamic pricing
- Technician scoring engine
- SLA routing
- Fraud prevention and quality automation

## 17. Production Readiness Checklist

- Role-based route guards
- API validation on every payload
- Audit logging for admin and finance actions
- Retry-safe payment webhooks
- Booking event history table
- Search indexes for city/category/location
- Rate limiting for auth and booking APIs
- Centralized error monitoring
- Uptime and SLA alerts
- Backoffice tooling for disputes and manual override

This architecture is sufficient to build Fixora as a production-ready service marketplace platform with clear role separation, scalable backend boundaries, and a premium UI direction aligned with Urban Company-style service discovery and Uber-style dispatch visibility.
