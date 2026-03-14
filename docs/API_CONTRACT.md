# Fixora API Contract

This document defines the primary REST surface for a production Fixora backend using Node.js, Express, and PostgreSQL.

## Authentication

### POST /api/v1/auth/send-otp

Request:

```json
{
  "phone": "+919876543210",
  "purpose": "login"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "requestId": "otp_req_123",
    "expiresIn": 300
  }
}
```

### POST /api/v1/auth/verify-otp

```json
{
  "requestId": "otp_req_123",
  "phone": "+919876543210",
  "otp": "123456"
}
```

### POST /api/v1/auth/register

```json
{
  "name": "Aditi Jain",
  "email": "aditi@example.com",
  "phone": "+919876543210",
  "password": "StrongPass123"
}
```

### POST /api/v1/auth/login

```json
{
  "identifier": "aditi@example.com",
  "password": "StrongPass123"
}
```

## Technician Discovery

### GET /api/v1/technicians/search

Query params:

- `category`
- `lat`
- `lng`
- `minRating`
- `maxDistanceKm`
- `minExperienceYears`
- `priceMin`
- `priceMax`
- `sort`
- `page`
- `limit`

Response shape:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "tech_123",
        "name": "Rohit Sharma",
        "profilePhotoUrl": "https://cdn.example.com/rohit.jpg",
        "serviceType": "Electrician",
        "experienceYears": 8,
        "rating": 4.9,
        "completedJobs": 1200,
        "distanceKm": 2.4,
        "availabilityStatus": "online",
        "startingPrice": 299
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 88
    }
  }
}
```

### GET /api/v1/technicians/:id

Returns profile, services, skills, area, reviews summary, pricing, and availability.

## Technician Registration

### POST /api/v1/technicians/register

Multipart form data:

- `personal`
- `professional`
- `serviceArea`
- `paymentDetails`
- `aadhaar`
- `pan`
- `profilePhoto`
- `certificates[]`

Response:

```json
{
  "success": true,
  "data": {
    "technicianId": "tech_123",
    "verificationStatus": "pending"
  }
}
```

## Bookings

### POST /api/v1/bookings

```json
{
  "customerName": "Aditi Jain",
  "phone": "+919876543210",
  "address": {
    "addressLine1": "221B, Vaishali Nagar",
    "city": "Jaipur",
    "pinCode": "302021",
    "latitude": 26.9124,
    "longitude": 75.7873
  },
  "serviceCategoryId": "svc_electrician",
  "problemDescription": "Ceiling fan stopped working",
  "problemPhotos": [
    "https://cdn.example.com/photo1.jpg"
  ],
  "preferredDate": "2026-03-16",
  "preferredTimeSlot": "10:00-12:00",
  "preferredTechnicianId": "tech_123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "bookingId": "bk_123",
    "status": "pending",
    "estimatedPrice": 349,
    "serviceFee": 49,
    "totalCost": 398
  }
}
```

### GET /api/v1/bookings/:id

Returns booking details, technician summary, status timeline, location, and invoice summary.

### PATCH /api/v1/bookings/:id/cancel

```json
{
  "reason": "Customer unavailable"
}
```

### PATCH /api/v1/bookings/:id/reschedule

```json
{
  "preferredDate": "2026-03-17",
  "preferredTimeSlot": "14:00-16:00"
}
```

### PATCH /api/v1/technicians/me/jobs/:bookingId/status

```json
{
  "status": "on_the_way",
  "latitude": 26.901,
  "longitude": 75.801
}
```

## Reviews

### POST /api/v1/reviews

```json
{
  "bookingId": "bk_123",
  "rating": 5,
  "reviewText": "Professional and quick service"
}
```

## Payments

### POST /api/v1/payments/create-intent

```json
{
  "bookingId": "bk_123",
  "amount": 39800,
  "currency": "INR"
}
```

### POST /api/v1/payments/webhook

Provider webhook receiver for payment capture, refund, and settlement events.

## Admin

### GET /api/v1/admin/technicians/pending

Returns pending technician applications with document previews.

### PATCH /api/v1/admin/technicians/:id/approve

```json
{
  "note": "Approved after KYC review"
}
```

### PATCH /api/v1/admin/technicians/:id/reject

```json
{
  "reason": "PAN image unclear"
}
```

### PATCH /api/v1/admin/technicians/:id/suspend

```json
{
  "reason": "Repeated no-shows"
}
```

### GET /api/v1/admin/dashboard

Returns KPI metrics, demand snapshots, and alert counters.
