import { randomUUID } from 'node:crypto'
import { database } from '../data-access/database.ts'
import type {
  Actor,
  Briefing,
  Handoff,
  Incident,
  IncidentSeverity,
  IncidentState,
  RepoCheck,
} from './briefdock-types.ts'

interface IncidentRow {
  id: string
  title: string
  source: string
  severity: IncidentSeverity
  state: IncidentState
  evidence_url: string | null
  due_at: string
  hold_until: string | null
  holder: Actor | null
  created_at: string
  updated_at: string
}

interface HandoffRow {
  id: string
  incident_id: string
  actor: Actor
  action: string
  note: string
  created_at: string
}

interface RepoCheckRow {
  id: string
  repo: string
  status: 'ok' | 'watch'
  summary: string
  pushed_at: string | null
  url: string
  checked_at: string
}

const staleHours = 36

export function getBriefing(): Briefing {
  const incidents = database
    .query<IncidentRow, []>('SELECT * FROM incidents ORDER BY state ASC, due_at ASC, updated_at DESC')
    .all()
    .map(toIncident)
  const checks = database
    .query<RepoCheckRow, []>('SELECT * FROM repo_checks ORDER BY checked_at DESC LIMIT 12')
    .all()
    .map(toRepoCheck)
  const handoffs = database
    .query<HandoffRow, []>('SELECT * FROM handoffs ORDER BY created_at DESC LIMIT 18')
    .all()
    .map(toHandoff)
  const now = Date.now()

  return {
    checks,
    generatedAt: new Date().toISOString(),
    handoffs,
    incidents,
    metrics: {
      cleared: incidents.filter((incident) => incident.state === 'cleared').length,
      held: incidents.filter((incident) => incident.state === 'held').length,
      open: incidents.filter((incident) => incident.state === 'open').length,
      overdue: incidents.filter((incident) => incident.state !== 'cleared' && Date.parse(incident.dueAt) < now).length,
    },
  }
}

export function createSession(actor: Actor) {
  const token = randomUUID()
  database
    .query('INSERT INTO sessions (token, actor, created_at) VALUES (?1, ?2, ?3)')
    .run(token, actor, new Date().toISOString())

  return { actor, token }
}

export function getSessionActor(token: string): Actor | null {
  const row = database.query<{ actor: Actor }, [string]>('SELECT actor FROM sessions WHERE token = ?1').get(token)

  return row?.actor ?? null
}

export function holdIncident({
  actor,
  incidentId,
  minutes,
  note,
}: {
  actor: Actor
  incidentId: string
  minutes: number
  note: string
}) {
  const now = new Date()
  const holdUntil = new Date(now.getTime() + minutes * 60_000).toISOString()
  database
    .query('UPDATE incidents SET state = ?1, hold_until = ?2, holder = ?3, updated_at = ?4 WHERE id = ?5')
    .run('held', holdUntil, actor, now.toISOString(), incidentId)
  insertHandoff({ action: `held for ${minutes}m`, actor, incidentId, note })

  return getBriefing()
}

export function clearIncident({ actor, incidentId, note }: { actor: Actor; incidentId: string; note: string }) {
  database
    .query('UPDATE incidents SET state = ?1, hold_until = NULL, holder = NULL, updated_at = ?2 WHERE id = ?3')
    .run('cleared', new Date().toISOString(), incidentId)
  insertHandoff({ action: 'cleared', actor, incidentId, note })

  return getBriefing()
}

export function seedMissedNightshiftIncident() {
  upsertIncident({
    evidenceUrl: 'https://github.com/obrera/nightshift-agents',
    id: 'cron-nightshift-2026-05-15',
    severity: 'critical',
    source: 'OpenClaw cron',
    title: 'Nightshift scheduled run missed at 01:00 UTC',
  })
}

export async function ingestGitHubRepos(repos: string[]) {
  const checkedAt = new Date().toISOString()

  for (const repo of repos) {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'briefdock-nightshift-086' },
    })

    if (!response.ok) {
      upsertRepoCheck({
        checkedAt,
        repo,
        status: 'watch',
        summary: `GitHub returned ${response.status}`,
        url: `https://github.com/${repo}`,
      })
      upsertIncident({
        evidenceUrl: `https://github.com/${repo}`,
        id: `github-unreachable-${repo.replaceAll('/', '-')}`,
        severity: 'watch',
        source: 'GitHub repository check',
        title: `${repo} could not be checked`,
      })
      continue
    }

    const body = (await response.json()) as {
      pushed_at?: string
      stargazers_count?: number
      updated_at?: string
      html_url: string
    }
    const pushedAt = body.pushed_at ?? body.updated_at ?? null
    const ageHours = pushedAt ? (Date.now() - Date.parse(pushedAt)) / 3_600_000 : Number.POSITIVE_INFINITY
    const isStale = ageHours > staleHours
    const summary = pushedAt
      ? `Last push ${Math.round(ageHours)}h ago; ${body.stargazers_count ?? 0} stars`
      : 'Repository returned no push timestamp'

    upsertRepoCheck({
      checkedAt,
      pushedAt,
      repo,
      status: isStale ? 'watch' : 'ok',
      summary,
      url: body.html_url,
    })

    if (isStale) {
      upsertIncident({
        evidenceUrl: body.html_url,
        id: `github-stale-${repo.replaceAll('/', '-')}`,
        severity: 'watch',
        source: 'GitHub repository check',
        title: `${repo} has not shipped in ${Math.round(ageHours)}h`,
      })
    }
  }

  return getBriefing()
}

function upsertIncident({
  evidenceUrl,
  id,
  severity,
  source,
  title,
}: {
  evidenceUrl: string
  id: string
  severity: IncidentSeverity
  source: string
  title: string
}) {
  const now = new Date()
  const dueAt = new Date(now.getTime() + (severity === 'critical' ? 20 : 90) * 60_000).toISOString()
  database
    .query(
      `
      INSERT INTO incidents (id, title, source, severity, state, evidence_url, due_at, hold_until, holder, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, 'open', ?5, ?6, NULL, NULL, ?7, ?7)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        source = excluded.source,
        severity = excluded.severity,
        evidence_url = excluded.evidence_url,
        updated_at = excluded.updated_at
      `,
    )
    .run(id, title, source, severity, evidenceUrl, dueAt, now.toISOString())
}

function upsertRepoCheck({
  checkedAt,
  pushedAt = null,
  repo,
  status,
  summary,
  url,
}: {
  checkedAt: string
  pushedAt?: string | null
  repo: string
  status: 'ok' | 'watch'
  summary: string
  url: string
}) {
  database
    .query(
      `
      INSERT INTO repo_checks (id, repo, status, summary, pushed_at, url, checked_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        summary = excluded.summary,
        pushed_at = excluded.pushed_at,
        url = excluded.url,
        checked_at = excluded.checked_at
      `,
    )
    .run(`repo-${repo.replaceAll('/', '-')}`, repo, status, summary, pushedAt, url, checkedAt)
}

function insertHandoff({
  action,
  actor,
  incidentId,
  note,
}: {
  action: string
  actor: Actor
  incidentId: string
  note: string
}) {
  database
    .query('INSERT INTO handoffs (id, incident_id, actor, action, note, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
    .run(randomUUID(), incidentId, actor, action, note, new Date().toISOString())
}

function toIncident(row: IncidentRow): Incident {
  return {
    createdAt: row.created_at,
    dueAt: row.due_at,
    evidenceUrl: row.evidence_url,
    holder: row.holder,
    holdUntil: row.hold_until,
    id: row.id,
    severity: row.severity,
    source: row.source,
    state: row.state,
    title: row.title,
    updatedAt: row.updated_at,
  }
}

function toHandoff(row: HandoffRow): Handoff {
  return {
    action: row.action,
    actor: row.actor,
    createdAt: row.created_at,
    id: row.id,
    incidentId: row.incident_id,
    note: row.note,
  }
}

function toRepoCheck(row: RepoCheckRow): RepoCheck {
  return {
    checkedAt: row.checked_at,
    id: row.id,
    pushedAt: row.pushed_at,
    repo: row.repo,
    status: row.status,
    summary: row.summary,
    url: row.url,
  }
}
