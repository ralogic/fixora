# Fixora API Contract (Phase 1)

This document defines request and response contracts for the current Fixora backend and the immediate production hardening path.

## 1. Response Envelope

All APIs should return a consistent envelope.

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Failure

```json
{
  "success": false,
  "error": {
    "message": "Human readable message",
    "details": {}
  }
}
```

## 2. Headers and Governance

Required for write endpoints:
- `Content-Type: application/json`
- `X-Correlation-Id: <uuid>`
- `Idempotency-Key: <unique-key-per-operation>` for booking and payment creation

Recommended:
- `X-Client-Version: <semver>`
- `X-City-Slug: jaipur`

## 3. Booking

## POST /api/book-service

Creates a new order, validates city and service, ranks nearby technicians, and emits initial order events.

Request:

```json
{
  "customerId": "demo_customer_jaipur",
  "serviceId": "svc_electrician",
  "issueType": "switchboard_sparking",
  "issueNotes": "Sparks when turning on AC",
  "preferredTime": "2026-03-14T10:30:00.000Z",
  "location": {
    "addressLine": "Flat 302, Vaishali Nagar",
    "landmark": "Near Mall",
    "floor": "3",
    "lat": 26.9117,
    "lng": 75.7873,
    "citySlug": "jaipur"
  }
}
```

Validation rules:
- `customerId`: string min length 6
- `serviceId`: string min length 6
- `issueType`: string min length 2
- `issueNotes`: optional, max 1000
- `preferredTime`: optional ISO datetime
- `location.addressLine`: min 5
- `location.lat`: -90 to 90
- `location.lng`: -180 to 180

Success 200:

```json
{
  "success": true,
  "data": {
    "orderId": "ord_abc123",
    "status": "PENDING_ASSIGNMENT",
    "estimatedEtaMinutes": 22,
    "estimatedAmountPaise": 39900,
    "technician": {
      "id": "tech_1",
      "name": "Ravi Sharma",
      "avgRating": 4.7
    }
  }
}
```

Failure codes:
- `422`: invalid payload
- `404`: city or service not found/unavailable
- `500`: internal create failure

## 4. Technician Discovery

## GET /api/technicians?city=jaipur&serviceId=<id>&lat=<lat>&lng=<lng>

Returns ranked available technicians for a service/location.

Success 200:

```json
{
  "success": true,
  "data": {
    "city": "jaipur",
    "results": [
      {
        "technicianId": "tech_1",
        "name": "Ravi Sharma",
        "distanceKm": 2.1,
        "etaMinutes": 9,
        "avgRating": 4.8,
        "acceptanceRate": 0.94,
        "activeJobs": 1,
        "matchingScore": 1.822
      }
    ]
  }
}
```

Failure codes:
- `422`: missing query params
- `404`: city not found
- `500`: query failure

## 5. Orders

## GET /api/orders?customerId=<customer-id>

Returns latest 50 orders for a customer in reverse chronological order.

Success 200:

```json
{
  "success": true,
  "data": {
    "orders": []
  }
}
```

## GET /api/orders/{id}

Returns full order graph (service, location, payment, technician, events).

Success 200:

```json
{
  "success": true,
  "data": {
    "order": {}
  }
}
```

Failure codes:
- `404`: order not found
- `500`: fetch failure

## POST /api/orders/{id}/accept

Technician acceptance endpoint for dispatched assignment.

Request:

```json
{
  "technicianId": "tech_1"
}
```

Success 200:

```json
{
  "success": true,
  "data": {
    "orderId": "ord_abc123",
    "status": "ASSIGNED"
  }
}
```

Failure codes:
- `422`: technicianId missing
- `403`: technician mismatch
- `404`: order not found
- `500`: update failure

## 6. Payments

## POST /api/payments/create-intent

Creates Stripe payment intent and upserts payment record.

Request:

```json
{
  "orderId": "ord_abc123",
  "amountPaise": 49900,
  "currency": "inr"
}
```

Success 200 (stripe mode):

```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_..._secret_...",
    "paymentIntentId": "pi_..."
  }
}
```

Success 200 (development fallback):

```json
{
  "success": true,
  "data": {
    "clientSecret": "dev_client_secret",
    "paymentIntentId": "dev_intent_ord_abc123",
    "mode": "development"
  }
}
```

Failure codes:
- `422`: invalid payload
- `404`: order not found
- `500`: payment intent failure

## POST /api/payments/webhook

Stripe webhook source of truth for payment lifecycle.

Handled event types:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

Behavior:
- Updates `payments` state idempotently by `stripePaymentIntentId`
- Updates `orders.paymentStatus`
- Appends `order.events` entries

Failure codes:
- `400`: invalid signature or processing failure
- `503`: stripe/webhook not configured

## 7. Suggested Future Endpoints

Customer:
- `POST /api/orders/{id}/cancel`
- `POST /api/orders/{id}/rate`
- `POST /api/orders/{id}/support`

Technician:
- `POST /api/technicians/{id}/location`
- `POST /api/orders/{id}/start`
- `POST /api/orders/{id}/complete`

Admin:
- `GET /api/admin/orders/live`
- `POST /api/admin/orders/{id}/reassign`
- `POST /api/admin/pricing/rules`

## 8. Event Naming Contract

Canonical event names:
- `order.created`
- `dispatch.offer.sent`
- `dispatch.offer.accepted`
- `technician.location.updated`
- `order.status.updated`
- `payment.succeeded`
- `payment.failed`
- `payment.refunded`

## 9. Idempotency Rules

- Booking: deduplicate by `customer_id + service_id + location_hash + 60s window`
- Payment intent creation: deduplicate by `order_id + amount`
- Webhook handlers: always upsert/update by Stripe object id and event id

## 10. Error Catalog

Common error codes:
- `VALIDATION_ERROR`
- `CITY_NOT_SERVICEABLE`
- `SERVICE_UNAVAILABLE`
- `ORDER_NOT_FOUND`
- `TECHNICIAN_NOT_ASSIGNED`
- `PAYMENT_PROVIDER_UNAVAILABLE`
- `WEBHOOK_SIGNATURE_INVALID`
- `INTERNAL_ERROR`
