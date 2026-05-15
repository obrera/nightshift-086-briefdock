import { env } from '@workspace/env/server'
import { Hono } from 'hono'
import { z } from 'zod'
import {
  clearIncident,
  createSession,
  getBriefing,
  getSessionActor,
  holdIncident,
  ingestGitHubRepos,
  seedMissedNightshiftIncident,
} from './briefdock-repository.ts'
import type { Actor } from './briefdock-types.ts'

export const briefdockRoutes = new Hono()

const authSchema = z.object({
  actor: z.enum(['bee', 'obrera']),
  passcode: z.string().min(1),
})

const noteSchema = z.object({
  minutes: z.number().int().min(10).max(240).optional(),
  note: z.string().min(3).max(500),
})

briefdockRoutes.get('/health', (c) => {
  return c.json({
    ok: true,
    repos: env.GITHUB_REPOS,
    service: 'briefdock',
  })
})

briefdockRoutes.post('/auth/session', async (c) => {
  const body = authSchema.safeParse(await c.req.json())
  if (!body.success || body.data.passcode !== env.OPERATOR_PASSCODE) {
    return c.json({ error: 'invalid_credentials' }, 401)
  }

  return c.json(createSession(body.data.actor))
})

briefdockRoutes.get('/briefing', (c) => {
  const actor = requireActor(c.req.header('authorization'))
  if (!actor) {
    return c.json({ error: 'unauthorized' }, 401)
  }

  return c.json(getBriefing())
})

briefdockRoutes.post('/checks/ingest', async (c) => {
  const actor = requireActor(c.req.header('authorization'))
  if (!actor) {
    return c.json({ error: 'unauthorized' }, 401)
  }

  const briefing = await ingestGitHubRepos(env.GITHUB_REPOS)
  return c.json(briefing)
})

briefdockRoutes.post('/incidents/:id/hold', async (c) => {
  const actor = requireActor(c.req.header('authorization'))
  if (!actor) {
    return c.json({ error: 'unauthorized' }, 401)
  }

  const body = noteSchema.safeParse(await c.req.json())
  if (!body.success) {
    return c.json({ error: 'invalid_hold' }, 400)
  }

  return c.json(
    holdIncident({
      actor,
      incidentId: c.req.param('id'),
      minutes: body.data.minutes ?? 45,
      note: body.data.note,
    }),
  )
})

briefdockRoutes.post('/incidents/:id/clear', async (c) => {
  const actor = requireActor(c.req.header('authorization'))
  if (!actor) {
    return c.json({ error: 'unauthorized' }, 401)
  }

  const body = noteSchema.safeParse(await c.req.json())
  if (!body.success) {
    return c.json({ error: 'invalid_clear' }, 400)
  }

  return c.json(
    clearIncident({
      actor,
      incidentId: c.req.param('id'),
      note: body.data.note,
    }),
  )
})

seedMissedNightshiftIncident()

function requireActor(authorization: string | undefined): Actor | null {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null
  if (!token) {
    return null
  }

  return getSessionActor(token)
}
