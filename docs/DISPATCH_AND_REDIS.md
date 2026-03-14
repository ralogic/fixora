# Dispatch Algorithm and Redis Data Model

This document defines a production-ready dispatch loop for Fixora using the current ranking logic and a Redis acceleration layer.

## 1. Matching Objective

Primary objective:
- Minimize customer ETA while preserving quality and fairness.

Constraints:
- Service eligibility
- City and zone eligibility
- Technician online and verified state
- Anti-abuse and overload controls

## 2. Ranking Formula

Current weighted score (lower is better):

$$
score = w_1 d + w_2 (1-a) + w_3 (5-r) + w_4 j
$$

Where:
- $d$: distance in km
- $a$: acceptance rate (0 to 1)
- $r$: average rating (1 to 5)
- $j$: active jobs count

Current defaults:
- $w_1 = 0.55$
- $w_2 = 0.20$
- $w_3 = 0.15$
- $w_4 = 0.10$

ETA approximation:

$$
eta\_minutes = \max(5, \lceil (distance/24) \times 1.15 \times 60 \rceil)
$$

## 3. Dispatch State Machine

Order states:
- `PENDING`
- `PENDING_ASSIGNMENT`
- `ASSIGNED`
- `ON_THE_WAY`
- `ARRIVED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELED`

Offer lifecycle:
- Offer sent with 20s timeout
- Accept moves order to `ASSIGNED`
- Reject/timeout advances to next candidate
- After N failures, widen search radius

## 4. Pseudocode

```text
function dispatchOrder(orderId):
  order = loadOrder(orderId)
  if order.status not in [PENDING, PENDING_ASSIGNMENT]:
    return

  radiusKm = 6
  maxAttempts = 3

  for attempt in 1..maxAttempts:
    candidates = getEligibleTechnicians(
      cityId=order.cityId,
      zoneId=order.zoneId,
      serviceId=order.serviceId,
      center=order.location,
      radiusKm=radiusKm,
      limit=50
    )

    ranked = rankCandidates(candidates, order.location)
    top = first 10 from ranked

    for tech in top:
      offerId = createDispatchOffer(orderId, tech.id, ttl=20s)
      emit(technician:{tech.id}, dispatch.offer.sent)

      result = waitForOfferOutcome(offerId, 20s)

      if result == ACCEPTED:
        assignOrder(orderId, tech.id)
        emit(order:{orderId}, dispatch.offer.accepted)
        return

      markOfferClosed(offerId, result)

    radiusKm = radiusKm + 3

  markOrderDelayed(orderId)
  emit(order:{orderId}, dispatch.no_technician_available)
  notifyCityOps(order.cityId, orderId)
```

## 5. Fairness and Abuse Controls

- Cooldown penalties for repeated last-second cancellations
- Cap active jobs per technician by service category
- Demand balancing per zone to avoid over-concentration
- Temporary deprioritization for poor acceptance windows

## 6. Redis Keyspace

Use short TTLs and city/zone namespacing.

Technician presence:
- `tech:online:{cityId}` (SET)
- `tech:heartbeat:{techId}` (STRING, TTL 20s)

Geo index:
- `geo:tech:{cityId}:{serviceId}` (GEOSET)

Availability snapshots:
- `avail:{cityId}:{zoneId}:{serviceId}` (ZSET)

Dispatch offers:
- `dispatch:offer:{offerId}` (HASH, TTL 30s)
- `dispatch:order:{orderId}:offers` (LIST)

Order realtime cache:
- `order:status:{orderId}` (HASH, TTL 15m)
- `order:eta:{orderId}` (STRING, TTL 60s)

Pricing and surge cache:
- `pricing:{cityId}:{zoneId}:{category}` (HASH, TTL 5m)
- `surge:{cityId}:{zoneId}` (HASH, TTL 2m)

Idempotency:
- `idempotency:{endpoint}:{key}` (STRING/HASH, TTL 24h)

## 7. Suggested Redis Payloads

Dispatch offer hash fields:
- `orderId`
- `technicianId`
- `status` (`PENDING`, `ACCEPTED`, `REJECTED`, `TIMEOUT`)
- `expiresAt`
- `attempt`

Cached technician score snapshot:
- `distanceKm`
- `etaMinutes`
- `acceptanceRate`
- `avgRating`
- `activeJobs`
- `matchingScore`

## 8. Realtime Event Contract

Channels:
- `order:{orderId}`
- `technician:{technicianId}`
- `city_ops:{cityId}`

Critical events requiring ack:
- `dispatch.offer.sent`
- `dispatch.offer.accepted`
- `order.status.updated`
- `payment.succeeded`

Location events:
- every 3 to 5 seconds
- include sequence number and timestamp
- ignore out-of-order sequence on client

## 9. Failure and Recovery

Failure cases and actions:
- Socket disconnect: reconnect and resync order state from `/api/orders/{id}`
- Missed offer ack: retry 1x then next candidate
- Redis miss: fallback to DB query and repopulate cache
- No match in SLA: mark delayed and provide scheduled option

## 10. Metrics to Track

Dispatch KPIs:
- Assignment latency (p50, p90)
- Offer acceptance rate
- Offers per successful assignment
- No-match rate
- ETA prediction error

Operational alerts:
- assignment latency spike
- no-match spike by zone
- technician heartbeat drop
- socket reconnect surge
