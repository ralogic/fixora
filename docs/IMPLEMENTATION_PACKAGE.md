# Fixora Implementation Package

This package converts the product blueprint into execution-ready artifacts for engineering, product, and operations.

## Included Deliverables

1. Prisma schema draft for full operations model:
- [prisma/schema.v2-draft.prisma](../prisma/schema.v2-draft.prisma)

2. API contract with request/response payloads and governance:
- [docs/API_CONTRACT.md](API_CONTRACT.md)

3. Dispatch algorithm pseudocode and Redis data model:
- [docs/DISPATCH_AND_REDIS.md](DISPATCH_AND_REDIS.md)

4. 12-week engineering roadmap with staffing and budget bands:
- [docs/ROADMAP_12_WEEKS.md](ROADMAP_12_WEEKS.md)

5. One-day compression war plan for immediate execution:
- [docs/DAY0_EXECUTION_PLAN.md](DAY0_EXECUTION_PLAN.md)

## Recommended Next Execution Order

1. Review and approve API contract and event naming.
2. Align schema.v2 draft with migration strategy.
3. Implement idempotency key storage and correlation IDs.
4. Move dispatch into worker abstraction (even if same runtime initially).
5. Add Redis keyspace and cache invalidation hooks.
6. Add E2E coverage for booking -> dispatch -> payment -> completion.

## Notes

- The draft schema is intentionally additive and safe to review separately from the active schema.
- Current codebase already implements baseline booking, dispatch scoring, order retrieval, and Stripe flow.
- These docs are structured to support phase-wise rollout from Jaipur pilot to multi-city scaling.
