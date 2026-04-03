# AWS Well-Architected Review: adapt-learn

**Date**: 2026-04-03 (Post-Remediation Re-Review)
**URL**: https://adapt-learn-rosy.vercel.app
**Stack**: Next.js 16 + ElevenLabs TTS + Google Gemini LLM, Vercel
**Purpose**: Voice-first adaptive AI learning platform (hackathon project)

---

## Post-Remediation Status: PASS with caveats

All 2 criticals and 5 highs verified fixed. 0 npm production vulnerabilities. 2 new HIGH items.

### Verification

| Previous Finding | Status | Evidence |
|---|---|---|
| CRIT: Google API key in URL params | FIXED | Both routes use `x-goog-api-key` header |
| CRIT: Hardcoded password in source | FIXED | Server-side SITE_PASSWORD via /api/auth/verify |
| HIGH: Client-side password validation | FIXED | HMAC session tokens, timing-safe comparison, httpOnly cookies |
| HIGH: No rate limiting on AI endpoints | FIXED | Upstash Redis 10 req/min with in-memory fallback |
| HIGH: Path traversal in lesson API | FIXED | `/^[a-z0-9-]+$/` regex validation |
| HIGH: npm audit vulnerabilities | FIXED | 0 production vulnerabilities |
| HIGH: No server-side auth on API routes | FIXED | isAuthenticated() validates session cookie on all AI routes |

### Remaining Findings

| Severity | Pillar | Finding | Detail |
|----------|--------|---------|--------|
| HIGH | Security | No security headers in `next.config.mjs` | Add CSP, HSTS, X-Frame-Options, nosniff |
| HIGH | Security | `.env.example` references stale `NEXT_PUBLIC_SITE_PASSWORD` | Update to `SITE_PASSWORD`, add `SESSION_SECRET`, `UPSTASH_REDIS_REST_URL/TOKEN` |

### npm Audit
```
found 0 vulnerabilities (production)
```
