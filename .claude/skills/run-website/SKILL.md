---
name: run-website
description: Build, launch, and smoke-test the Premium Markup website — the Next.js 16 public site + /admin CMS + /portal + /cv on port 3001. Use to run, start, launch, build, serve, or verify the website, its routes, or its API auth-gating.
---

# Run: website

The public site is a **Next.js 16** app (App Router, Turbopack) on port **3001**: marketing
pages, the `/admin` CMS, the `/portal` leads view, and a static `/cv`. Auth is NextAuth v5
with middleware gating `/admin/*` and `/api/*`.

Drive it with the committed driver — it reuses a running server or builds + launches
`next start`, then smoke-tests the key routes and confirms the API is auth-gated.

> Paths below are relative to `website/` (the app dir). Verified on Windows, Node v25.
> **Next.js 16 is not the Next in your training data** — read the guides in
> `node_modules/next/dist/docs/` before writing App Router code (see `AGENTS.md`).

## Prerequisites

```bash
node --version   # >= 22
npm install      # postinstall runs `prisma generate` — required, or the build fails
```

## Build

```bash
npm run build    # next build — required before `next start`
```

The `.next/` output is what `next start` serves. The driver runs this automatically if
`.next/BUILD_ID` is missing.

## Run (agent path) — the driver

```bash
node .claude/skills/run-website/driver.mjs          # prod: build if needed, next start, smoke test
node .claude/skills/run-website/driver.mjs --dev    # use `next dev` (Turbopack) instead
node .claude/skills/run-website/driver.mjs --keep    # leave a server it started running
```

Reuses a server already on 3001, else launches one and kills it (tree-kill) afterward.
Exit `0` all passed, `1` a check failed, `2` never came up. It checks 11 things: `/`,
`/work`, `/services`, `/blog`, `/contact`, `/cv`, `/admin/login`, the SSG page
`/services/web-design` (all 200), home has branding, a missing route → 404, and
**`/api/health` → 307** (proof the middleware auth-gates `/api/*`). Ends with `11/11 checks passed.`

## Run (human path)

```bash
npm run dev      # Turbopack dev server on http://localhost:3001 (fast reload)
# or, after `npm run build`:
npm start        # next start on 3001 (production)
```

## Gotchas

- **`/api/*` and `/admin/*` are auth-gated** by `middleware.ts` (`matcher: ["/admin/:path*",
  "/api/:path*"]`). Unauthenticated API calls get **307 → login**, not 200 — the driver
  asserts this. A 200 on `/api/health` would mean the gate broke.
- **Runs fine with no `.env`.** Turso/AI/Google keys are optional at runtime: the site
  degrades gracefully (admin AI shows "not configured", the Turso-backed `/admin/prospects`
  is empty). No secrets are needed for the build or the smoke test.
- **Windows spawn traps (the driver handles these):** `npm` is a `.cmd`, so `spawn` needs
  `shell:true` (or you get `EINVAL`); and a shell child must be killed with `taskkill /PID … /T /F`
  or the real `next` process orphans on 3001.
- **Admin CMS writes don't persist on Vercel** (read-only FS) — content is edited locally
  and pushed. Not a run problem, but don't expect saved edits to survive a redeploy.
- **Static prerender:** most marketing pages are SSG (`revalidate = false` /
  `generateStaticParams`), so they serve instantly from `.next` without hitting a DB.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `spawn EINVAL` launching npm | Windows needs `shell:true` on the spawn (the driver sets it). |
| `next start` server left running on 3001 after driver | Shell-wrapped child; kill the tree with `taskkill /PID <pid> /T /F` (the driver does this). |
| Build fails referencing `@prisma/client` / `prisma` | `npm install` didn't run `postinstall` — run `npm install` (it does `prisma generate`). |
| Driver exits `2` (never came up) | Prod start needs a build — run `npm run build`, or use `--dev`. |
| Port 3001 already in use | The driver reuses a running server instead of failing. |
