# Fixora Day-0 Execution Plan (Compress 12 Weeks Into One Day)

This plan does not pretend one team can code 12 weeks of features in 24 hours. It compresses execution by parallelizing tracks, enforcing hard gates, and shipping the highest-impact launch slice today.

## What "Complete Today" Means

By end of day, you can complete:
- architecture and contract freeze
- CI gates and launch readiness checks
- database and API production draft package sign-off
- dispatch and realtime implementation skeleton approval
- launch runbooks, owners, and go/no-go criteria

By end of day, you cannot realistically complete:
- full multi-role product polish across customer, technician, and admin at production depth
- extensive real-world load and reliability burn-in
- full compliance and edge-case hardening

## Hard Outcome for Today

You leave today with:
- approved technical architecture
- implementation backlog broken into executable tickets
- validated build/lint/type gates in CI
- release readiness checklist runnable from codebase
- clear critical-path owner for each stream

## Parallel War-Room Streams

Stream A: Product + UX freeze
- lock customer booking and tracking scope
- define non-negotiable UX for hero, booking, tracking, payment

Stream B: Platform engineering
- API contract freeze
- schema v2 review and migration plan
- idempotency and correlation strategy

Stream C: Dispatch + realtime
- scoring formula and offer timeout policy
- Redis key model approval
- socket event contract and reconnect semantics

Stream D: Payments + finance
- payment intent policy (pre-auth vs post-job)
- webhook source-of-truth and refund rules
- invoice and payout state transitions

Stream E: Ops + launch
- Jaipur zone launch SOP
- technician onboarding throughput targets
- SLA escalation runbook

## 12-Hour Timeline

09:00 to 10:00: Kickoff and freeze constraints
- confirm launch city and initial categories
- approve KPI targets and SLA definitions

10:00 to 11:00: Data and API hard freeze
- review `prisma/schema.v2-draft.prisma`
- approve `docs/API_CONTRACT.md`

11:00 to 12:00: Dispatch and realtime lock
- approve `docs/DISPATCH_AND_REDIS.md`
- finalize event names and ack requirements

12:00 to 13:00: CI and quality gates
- run `npm run ci:verify`
- enforce branch policy: no merge without CI green

13:00 to 14:00: Lunch + async review comments

14:00 to 15:00: Payments and invoicing sign-off
- finalize payment lifecycle transitions
- verify webhook idempotency strategy

15:00 to 16:00: Admin and technician operational scope
- define day-1 must-have screens and actions
- remove non-critical dashboard metrics from launch scope

16:00 to 17:00: Risk and incident readiness
- finalize incident severity matrix
- assign on-call owners and escalation ladder

17:00 to 18:00: Ticketization and sprint split
- convert plan into engineering tickets by stream
- estimate each ticket and assign owners

18:00 to 19:00: Readiness check and go/no-go
- run `npm run ops:readiness`
- confirm all blockers and owner ETA

19:00 to 20:00: Executive summary and commit
- publish final launch plan doc
- lock next 10-day execution sprint

## Definition of Done Today

All must pass:
- CI workflow exists and green on branch
- API contract approved without open critical comments
- schema migration strategy approved
- dispatch fallback policy approved
- payment and refund state machine approved
- on-call and incident runbook owner assigned

## Immediate Commands

```bash
npm install
npm run prisma:generate
npm run ci:verify
npm run ops:readiness
```

## Deliverables You Already Have in This Repo

- `prisma/schema.v2-draft.prisma`
- `docs/API_CONTRACT.md`
- `docs/DISPATCH_AND_REDIS.md`
- `docs/ROADMAP_12_WEEKS.md`
- `docs/IMPLEMENTATION_PACKAGE.md`

## Next 10-Day Build Sprint (Post Day-0)

1. Build idempotency key persistence + middleware.
2. Implement dispatch worker with timed offer queue.
3. Add technician live location write endpoint.
4. Add customer order status resync endpoint for reconnect.
5. Add payment reconciliation job and refund endpoint.
6. Add E2E test for booking -> accept -> pay -> complete.
