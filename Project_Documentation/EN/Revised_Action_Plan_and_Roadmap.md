# Revised Action Plan & Roadmap

- **Date:** 2025-11-09
- **Owner:** Lead Software Engineer
- **Purpose:** Translate the ambition of `Change_Implementation_Plan_CIP.md` into a pragmatic, staged roadmap that recognises the current codebase realities and sequences work into achievable tickets.

---

## Epic 1: Database Layer Synchronisation
**Goal:** Align the backend data-access layer with the indexing and repository patterns envisioned in the CIP by first understanding the current Supabase usage and planning the transition deliberately.

- **DB-01 – Supabase Usage Audit**
  - *Description:* Catalogue every direct Supabase interaction across `/api/src/**` (services, modules, utilities). Record the tables, RPCs, filters, and query patterns in `docs/data-access/supabase-audit.md`.
  - *Exit Criteria:* Inventory spreadsheet + narrative summary reviewed by backend team.

- **DB-02 – Schema Mapping & Entity Drafts**
  - *Description:* Reverse-engineer Supabase table definitions (via `supabase_schema.sql` and live introspection) and draft accurate TypeORM entity files mirroring current schema/index needs.
  - *Dependencies:* DB-01.
  - *Exit Criteria:* New entity stubs committed under `/api/src/entities/` with TODO markers for relationships.

- **DB-03 – Repository Migration Blueprint**
  - *Description:* Produce a migration playbook that outlines how each audited service will move from direct Supabase calls to a repository pattern using the new entities.
  - *Dependencies:* DB-01, DB-02.
  - *Exit Criteria:* Document in `docs/data-access/migration-plan.md` including phased rollout strategy and risk mitigations.

- **DB-04 – Index Implementation Strategy**
  - *Description:* Translate CIP §2.2 index requirements into executable Supabase migrations (SQL scripts) and define deployment sequencing.
  - *Dependencies:* DB-02 (accurate schema insight).
  - *Exit Criteria:* Reviewed SQL scripts and rollback plan stored in `database/migrations/pending`.

---

## Epic 2: Foundational JWT & Security Overhaul
**Goal:** Establish a robust authentication architecture supporting access/refresh tokens, secure storage, and end-to-end validation.

- **SEC-01 – Refresh Token Persistence Design**
  - *Description:* Design the data model (table structure, retention policy, device metadata) for storing refresh tokens securely in Supabase or dedicated storage.
  - *Exit Criteria:* ERD + schema migration scripts in `database/migrations/pending`.

- **SEC-02 – Auth Service Blueprint**
  - *Description:* Specify the NestJS `AuthService`, guards, strategies, and DTO contracts required for issuing, rotating, and revoking tokens. Include error-handling and logging requirements.
  - *Dependencies:* SEC-01.
  - *Exit Criteria:* Architectural spec in `docs/security/auth-service-blueprint.md`.

- **SEC-03 – Backend Prototype Implementation**
  - *Description:* Implement the foundational NestJS modules (strategies, guards, controllers) supporting login, refresh, and logout endpoints, returning HttpOnly cookies.
  - *Dependencies:* SEC-02.
  - *Exit Criteria:* Passing integration tests covering token issuance/refresh + API documentation updated.

- **SEC-04 – Frontend Auth Context & Interceptors**
  - *Description:* Create a dedicated auth context/store that consumes HttpOnly cookies, adds Axios interceptors for 401 recovery, and handles forced logout flows.
  - *Dependencies:* SEC-03 (backend endpoints).
  - *Exit Criteria:* Frontend integration tests verifying silent refresh and session persistence.

- **SEC-05 – DTO Validation Coverage Audit**
  - *Description:* Audit all critical DTOs for missing `class-validator` decorators and plan updates aligned with new security expectations.
  - *Exit Criteria:* Checklist with prioritised fixes ready for execution sprint.

---

## Epic 3: Environment Configuration Restructuring
**Goal:** Introduce environment-aware bootstrapping that supports one-command switching between staging and production, in alignment with the CIP.

- **ENV-01 – Configuration Inventory & Gap Analysis**
  - *Description:* Document current env-variable usage across backend/frontend, PM2 configs, and scripts. Identify conflicts with CIP expectations.
  - *Exit Criteria:* Report in `docs/config/env-inventory.md`.

- **ENV-02 – Config Module Redesign**
  - *Description:* Draft the new folder structure (`config/env/…`), loading order, runtime selection logic (`APP_ENV`), and PM2 interpreter arguments.
  - *Dependencies:* ENV-01.
  - *Exit Criteria:* Design spec + proof-of-concept branch demonstrating environment switching.

- **ENV-03 – Backend Bootstrapping Update**
  - *Description:* Update `api/src/main.ts` and related modules to consume the new config strategy, ensuring backward compatibility with local development.
  - *Dependencies:* ENV-02.
  - *Exit Criteria:* Backend boots correctly in dev/staging with new config files; regression tests green.

- **ENV-04 – Frontend Configuration Alignment**
  - *Description:* Update Next.js runtime config (`next.config.js`, env loading) and deployment scripts (PM2, package scripts) to honour `APP_ENV`.
  - *Dependencies:* ENV-02.
  - *Exit Criteria:* Frontend runs locally and in staging with correct API targets derived from env.

- **ENV-05 – Deployment Automation Update**
  - *Description:* Modify deployment tooling (CI/CD, shell scripts) to inject correct env files and restart PM2 with the new interpreter args.
  - *Dependencies:* ENV-03, ENV-04.
  - *Exit Criteria:* Smoke-tested deploy to staging using revised process.

---

## Epic 4: Frontend Performance Audit & Execution
**Goal:** Deliver incremental, high-impact performance gains while setting up long-term monitoring and remediation workflows.

- **FE-01 – Component Performance Audit**
  - *Description:* Profile key routes (`/dashboard`, `/dashboard/properties`, `/dashboard/customers`) to identify heavy components, blocking scripts, and image bottlenecks. Record findings in `docs/perf/frontend-audit.md`.
  - *Exit Criteria:* Ranked list of components with remediation suggestions.

- **FE-02 – Image Optimisation Rollout Plan**
  - *Description:* Plan systematic conversion from `<img>` to `next/image`, including asset sizing strategy, CDN considerations, and fallback handling.
  - *Dependencies:* FE-01.
  - *Exit Criteria:* Standards document + backlog of component-level tasks.

- **FE-03 – Dynamic Import Strategy**
  - *Description:* Catalogue heavy client-only dependencies (e.g., charts, maps) and plan `next/dynamic` adoption with loading placeholders and streaming integration.
  - *Dependencies:* FE-01.
  - *Exit Criteria:* Implementation guide + prioritised checklist.

- **FE-04 – Immediate Quick Wins**
  - *Description:* Implement targeted optimisations (top 3 components) identified in FE-01, including `next/image`, `next/dynamic`, and Suspense-friendly loading states.
  - *Dependencies:* FE-01.
  - *Exit Criteria:* Benchmarked performance improvements (Lighthouse/Bundles) documented post-change.

- **FE-05 – Monitoring & Regression Guardrails**
  - *Description:* Integrate Lighthouse CI and bundle size reporting into PR checks, establishing budgets aligned with CIP targets.
  - *Dependencies:* FE-04.
  - *Exit Criteria:* Automated checks blocking regressions on key routes.

---

## Sequencing & Next Steps
1. Kick off **Front-End Quick Wins (FE-04)** to deliver immediate value while audits (FE-01) progress in parallel.  
2. Initiate **ENV-01 / ENV-02** to unblock future deployment and security work.  
3. Conduct **DB-01** audit to inform both database and authentication epics.  
4. Use completed audits/specs to feed implementation sprints, ensuring each Epic moves from discovery → design → execution with clear dependencies.  
5. Revisit the original CIP after each epic milestone to validate alignment and adjust roadmap based on findings.

---

> This roadmap converts the broad ambitions of `Change_Implementation_Plan_CIP.md` into staged, reviewable work packages. Each ticket can be scheduled, estimated, and tracked independently, enabling incremental progress while maintaining strategic alignment.

