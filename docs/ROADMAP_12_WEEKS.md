# Fixora 12-Week Engineering Roadmap

Goal: launch Jaipur with reliable 30-minute service and production-grade operational controls.

## Team Assumption

Suggested initial team:
- 1 Product Engineer Lead
- 2 Full-stack Engineers
- 1 Frontend Engineer
- 1 Backend Engineer
- 1 QA/Automation Engineer
- 1 DevOps (part-time shared)
- 1 Data/Analytics Engineer (part-time from week 7)

## Budget Bands (Engineering Only)

Estimated 12-week build cost range:
- Lean: INR 32L to 45L
- Standard: INR 46L to 70L
- Aggressive (faster parallelization): INR 71L to 95L

Excludes:
- paid marketing
- technician onboarding ops cost
- payment gateway MDR and cloud overages

## Week-by-Week Plan

## Week 1: Foundation Lock

Outcomes:
- Freeze architecture and module boundaries
- Finalize schema v2 migration plan
- Define API governance and error catalog

Deliverables:
- approved data model
- API contract baseline
- environments: dev, staging, prod templates

## Week 2: Identity and Access

Outcomes:
- Customer auth baseline
- Technician auth + device bind draft
- Admin RBAC scaffolding

Deliverables:
- auth endpoints and token lifecycle
- refresh token rotation and revocation
- role guards in app routes

## Week 3: Service Catalog and Pricing

Outcomes:
- city/zone aware service catalog
- pricing rules with zone multipliers

Deliverables:
- service read APIs
- pricing compute module
- admin pricing CRUD (MVP)

## Week 4: Booking UX and Order Creation Hardening

Outcomes:
- premium customer booking flow with draft persistence
- strict validation and idempotency on booking

Deliverables:
- full stepper UX
- improved failure states and retry handling
- booking observability traces

## Week 5: Dispatch Engine v1

Outcomes:
- deterministic dispatch worker loop
- offer timer and fallback radius expansion

Deliverables:
- dispatch offer lifecycle store
- technician ranking tuning controls
- no-match escalation flow

## Week 6: Technician App Core

Outcomes:
- online/offline shift control
- incoming offer, accept/reject, active job journey

Deliverables:
- technician PWA screens
- map navigation deep links
- checklist and completion actions

## Week 7: Live Tracking and Realtime Reliability

Outcomes:
- customer live map and ETA chip updates
- sequence-aware location streaming

Deliverables:
- channel contracts and reconnect state sync
- socket reliability dashboards
- degraded mode UX for weak network

## Week 8: Payments, Invoicing, Refunds

Outcomes:
- payment intent lifecycle complete
- webhook idempotency and reconciliation

Deliverables:
- invoice generation pipeline
- refund flow with admin reason tracking
- failed-payment retry UX

## Week 9: Admin Command Center

Outcomes:
- live order board and reassignment actions
- technician verification workflows

Deliverables:
- city/zone management UI
- SLA breach alerts
- audit logs for critical admin actions

## Week 10: Quality, Security, and Compliance

Outcomes:
- complete E2E smoke suite
- security hardening and PII controls

Deliverables:
- threat model checklist
- masked support views
- backup/restore drill in staging

## Week 11: Performance and Scale Readiness

Outcomes:
- hot path optimization for booking/dispatch
- Redis-backed cache enablement

Deliverables:
- load test report
- p95 latency targets met for core APIs
- queue design for async jobs

## Week 12: Jaipur Go-Live and Hypercare

Outcomes:
- staged rollout with limited zones
- real-time war-room operations

Deliverables:
- launch runbook
- rollback and incident playbook
- daily KPI dashboard with owners

## Milestone Gates

Gate 1 (End Week 4):
- booking funnel stable
- schema and API contracts frozen for launch scope

Gate 2 (End Week 8):
- dispatch + payments + tracking fully integrated
- SLA simulation pass rate >= 85%

Gate 3 (End Week 12):
- launch criteria met in production canary zones

## Hiring Plan by Stage

Weeks 1 to 4:
- core product squad only

Weeks 5 to 8:
- add dedicated backend and QA automation bandwidth

Weeks 9 to 12:
- add data analyst and ops tooling support

## KPI Targets for First 90 Days Post-Launch

- Median assignment time < 3 minutes
- 30-minute arrival success > 85%
- Completion rate > 92%
- Average rating > 4.5
- Repeat customer rate > 30%

## Risk Register

Top risks:
- technician supply instability by zone
- payment completion drop-offs
- realtime disconnects during peak
- unclear ownership in incident response

Mitigations:
- standby technician pool and incentive rules
- fallback payment methods and clear retry UX
- reconnect + state resync contract
- on-call rota and runbooks with escalation matrix
