# Process Log

## 2026-05-21

### Harness

- Current cmux workspace: `workspace:7`
- Codex surface: `surface:21`
- Claude surface: `surface:20`
- Communication rule file updated: `COMMUNICATION_RULE.md`
- Working branch: `dev`
- Remote: `origin/dev`

### Claude Cross-Review

Claude's first critique was that the requested persona/factbook/fanout workflow can become too large for the current repo. The useful correction was to pin Dev 1 to a golden path spike: teacher creates one real report, parent opens it from an external URL, and PDF/mobile viewing works.

Accepted adjustments:

- Keep research/persona records because the user explicitly requested them.
- Compress planning docs into `docs/FACTBOOK.md`, `docs/DEV_CYCLES.md`, `docs/PROCESS_LOG.md`.
- Put structured source/persona/use-case data under `data/research`.
- Do not let research delay Dev 1 blockers.

### Subagent Findings Integrated

UX/content:

- Report creation is too manual and lacks draft/update/copy.
- Presets need search, already-added state, filters, and paired suggestions.
- Production copy should not say `DB 저장`, `draft`, or "학생 포털" when the real audience is parents.
- Demo credentials should not render on production-token parent forms.
- Parent portal is really a guardian report archive, so "학부모 보고서함" is clearer.

Security/QA:

- Portal tokens exposed DB UUIDs through `pl_<uuid>`.
- Portal links had nullable expiry.
- Service-role parent reads need explicit tenant checks.
- Failure counting should use atomic DB functions.
- RLS must verify related row ownership, not only `teacher_id`.
- CI/e2e/RLS/a11y/PDF checks are missing.

Architecture:

- Current implemented flow exists but is insert-only and publish-immediate.
- Teacher pages still fall back to demo data in signed-out states.
- Student+parent and report+portal writes are not transactional.
- `/p/:token` is the real parent portal. The legacy `/r/:token` single-report demo was removed from the app.

### Dev 1 Changes Started

- Replaced generated portal tokens with random opaque tokens.
- Stopped token lookup by DB ID; parent portal now looks up only by token hash.
- Added tenant checks to parent portal service-role queries.
- Added default two-year portal link expiry and stronger RLS policy migration.
- Hid demo credentials outside demo parent routes.
- Renamed parent-facing UI from "학생 포털" to "학부모 보고서함".
- Added security headers for noindex/no-store/referrer/frame/content-type.
- Added Korean webfont imports for Pretendard/SUIT.
- Exposed daily practice minutes/reps in the report editor.
- Removed the legacy `/r` single-report demo route so the operational path is `/p/:token`.
- Claude regression review caught a migration issue: `expires_at = null` legacy links must be revoked, not silently extended. `0004` and app null-expiry handling were corrected.

### Next Checks

- `npm run lint -- --no-cache`: passed.
- `npm run typecheck -- --incremental false`: passed.
- `npm run build`: passed.
- Runtime smoke on `next start -p 3001`: `/`, `/teacher`, `/p/demo-portal` returned 200; `/p/demo-portal/reports` redirects to auth before cookie; demo verify returns 303 with scoped cookie.
- After removing `/r`, `.next` cache was cleared and `npm run lint`, `npm run typecheck`, `npm run build` passed again. Build route list now includes only `/p` parent routes.
- Existing-link regression was corrected: when a report is added for a student with an active report함 link, the app issues a fresh opaque URL that keeps the existing PIN; reset revokes other active links and creates a new PIN.
- `supabase` CLI is not installed locally, so migration `0004_parent_portal_security.sql` still needs Supabase project application/verification.

### Dev 2 Changes

- Added quick period registration templates for the current Korean school-year flow: 1학기, 2학기, 1-4분기.
- Split period registration into "빠른 기간 등록" and "직접 기간 등록" so teachers do not have to type common dates repeatedly.

### Dev 3 Changes

- Added `npm run quality`.
- The quality gate verifies research data counts, source/use-case data, core docs, removal of `/r`, opaque token structure, and presence of migration `0004`.
- Dev 2/3 validation: `npm run quality`, `npm run lint -- --no-cache`, `npm run typecheck -- --incremental false`, and `npm run build` passed.
- Read Claude's blocker list once it finishes.
- Push `dev` after checks pass, then verify Vercel Preview from the external URL.
