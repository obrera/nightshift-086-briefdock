import { env } from '@workspace/env/web'

export type Actor = 'bee' | 'obrera'
export type IncidentState = 'cleared' | 'held' | 'open'
export type IncidentSeverity = 'critical' | 'watch'

export interface Incident {
  id: string
  title: string
  source: string
  severity: IncidentSeverity
  state: IncidentState
  evidenceUrl: string | null
  dueAt: string
  holdUntil: string | null
  holder: Actor | null
  createdAt: string
  updatedAt: string
}

export interface Handoff {
  id: string
  incidentId: string
  actor: Actor
  action: string
  note: string
  createdAt: string
}

export interface RepoCheck {
  id: string
  repo: string
  status: 'ok' | 'watch'
  summary: string
  pushedAt: string | null
  url: string
  checkedAt: string
}

export interface Briefing {
  generatedAt: string
  incidents: Incident[]
  checks: RepoCheck[]
  handoffs: Handoff[]
  metrics: {
    cleared: number
    held: number
    open: number
    overdue: number
  }
}

export interface Session {
  actor: Actor
  token: string
}

export async function createBriefdockSession(actor: Actor, passcode: string): Promise<Session> {
  return request<Session>('/api/auth/session', {
    body: JSON.stringify({ actor, passcode }),
    method: 'POST',
  })
}

export async function getBriefdockBriefing(token: string): Promise<Briefing> {
  return request<Briefing>('/api/briefing', authOptions(token))
}

export async function ingestBriefdockChecks(token: string): Promise<Briefing> {
  return request<Briefing>('/api/checks/ingest', {
    ...authOptions(token),
    method: 'POST',
  })
}

export async function holdBriefdockIncident({
  incidentId,
  minutes,
  note,
  token,
}: {
  incidentId: string
  minutes: number
  note: string
  token: string
}): Promise<Briefing> {
  return request<Briefing>(`/api/incidents/${incidentId}/hold`, {
    ...authOptions(token),
    body: JSON.stringify({ minutes, note }),
    method: 'POST',
  })
}

export async function clearBriefdockIncident({
  incidentId,
  note,
  token,
}: {
  incidentId: string
  note: string
  token: string
}): Promise<Briefing> {
  return request<Briefing>(`/api/incidents/${incidentId}/clear`, {
    ...authOptions(token),
    body: JSON.stringify({ note }),
    method: 'POST',
  })
}

function authOptions(token: string): RequestInit {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  const response = await fetch(`${env.API_URL}${path}`, { ...init, headers })

  if (!response.ok) {
    throw new Error(`BriefDock API returned ${response.status}`)
  }

  return (await response.json()) as T
}
