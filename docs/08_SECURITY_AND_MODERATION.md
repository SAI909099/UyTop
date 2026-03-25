# 08_SECURITY_AND_MODERATION.md

## Auth And Session Policy
- JWT access + refresh tokens
- refresh rotation enabled
- refresh blacklist enabled
- role-aware server-side authorization required for all write operations

## Role Access
- guest:
  - browse approved listings only
- user:
  - browse, favorite, report, save searches
- owner:
  - user permissions plus own listing CRUD and lifecycle actions
- admin:
  - moderation, report review, approval/rejection, operational visibility

## Moderation Flow
1. Owner creates or updates a draft listing.
2. Owner submits listing for review.
3. Admin approves or rejects.
4. Approval writes a moderation action and audit log entry.
5. Rejection writes notes and keeps the listing non-public.

## Abuse Controls
- report fake or suspicious listings
- one owner cannot mutate another owner’s listings
- public listing visibility is approval-gated
- audit logs capture admin moderation actions

## Deferred Security Work
- OTP verification
- forgot password
- rate limiting
- upload signature validation
- duplicate detection heuristics
