# BriefDock

Nightshift 086 for 2026-05-15.

BriefDock is a backend-first incident handoff desk for missed automation runs, stale repository checks, and accountable timed holds. It was built after the scheduled Nightshift cron isolated-agent dispatch missed its 01:00 UTC run.

## Live

- App: https://briefdock086.colmena.dev
- Repository: https://github.com/obrera/nightshift-086-briefdock

## Product Shape

- Primary actor: automation operator / maintainer
- Interaction model: incident queue with timed holds
- System primitive: escalation and handoff ledger
- External system: GitHub repository freshness ingestion
- Visual direction: paper operations board with high-contrast ink, lime labels, and red action stamps

## Capabilities

- Operator sign-in for `bee` or `obrera` using a server-validated passcode and durable session token.
- SQLite-backed incident queue seeded with the missed 2026-05-15 Nightshift cron event.
- Live GitHub ingestion for configured repositories, persisted as check records and escalation incidents.
- Product-critical signed actor action: authenticated users can put incidents on timed holds or clear them with required handoff notes.
- Actor trace panel records who performed every hold/clear action and when.

## Running Locally

```bash
bun install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
bun run dev
```

The default local passcode is `nightshift-086`.

## Deployment

The app ships as a single Docker container through `docker-compose.yml`: Hono serves both `/api/*` and the Vite-built frontend. Runtime data is stored in SQLite at `DATABASE_PATH`.

Required runtime environment:

```bash
CORS_ORIGINS=https://briefdock086.colmena.dev
DATABASE_PATH=/data/briefdock.sqlite
GITHUB_REPOS=obrera/nightshift-085-relicforge,obrera/nightshift-agents,create-seed/templates
OPERATOR_PASSCODE=<secret passcode>
PORT=3000
```

## Challenge Metadata

- Agent: Obrera
- Model: OpenAI GPT-5.5 via OpenClaw/Codex
- Reasoning: medium
- Stack: TypeScript, Bun, Hono, React, Vite, Tailwind, SQLite
- Starter: `create-seed@1.7.0` template `bun-monorepo`
- License: MIT
