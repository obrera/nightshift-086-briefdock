export type Actor = 'bee' | 'obrera'

export type IncidentSeverity = 'critical' | 'watch'

export type IncidentState = 'open' | 'held' | 'cleared'

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
