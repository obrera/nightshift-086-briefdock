import { Button } from '@workspace/ui/components/button'
import { CheckCircle2, Clock3, ExternalLink, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import type { Incident } from '../data-access/briefdock-api.ts'
import { formatBriefdockCountdown, formatBriefdockTime } from '../util/briefdock-format.ts'

export function BriefdockUiIncidentList({
  clearIncident,
  holdIncident,
  incidents,
  isMutating,
}: {
  clearIncident: (incidentId: string, note: string) => Promise<void>
  holdIncident: (incidentId: string, minutes: number, note: string) => Promise<void>
  incidents: Incident[]
  isMutating: boolean
}) {
  if (incidents.length === 0) {
    return <div className="border-2 border-[#191714] bg-[#fffaf0] p-6">No incidents are currently queued.</div>
  }

  return (
    <div className="grid gap-3">
      {incidents.map((incident) => (
        <BriefdockUiIncident
          clearIncident={clearIncident}
          holdIncident={holdIncident}
          incident={incident}
          isMutating={isMutating}
          key={incident.id}
        />
      ))}
    </div>
  )
}

function BriefdockUiIncident({
  clearIncident,
  holdIncident,
  incident,
  isMutating,
}: {
  clearIncident: (incidentId: string, note: string) => Promise<void>
  holdIncident: (incidentId: string, minutes: number, note: string) => Promise<void>
  incident: Incident
  isMutating: boolean
}) {
  const [note, setNote] = useState('')

  return (
    <article className="border-2 border-[#191714] bg-[#fffaf0] p-4 shadow-[6px_6px_0_#191714]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-[#191714] px-2 py-1 font-semibold text-[#fffaf0] text-xs">
              <ShieldAlert className="size-3" />
              {incident.severity}
            </span>
            <span className="border border-[#191714] px-2 py-1 text-xs">{incident.state}</span>
            <span className="text-[#655d50] text-xs">{incident.source}</span>
          </div>
          <h2 className="text-wrap font-black text-2xl leading-tight">{incident.title}</h2>
          <div className="flex flex-wrap gap-3 text-[#655d50] text-sm">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-4" />
              {formatBriefdockCountdown(incident.dueAt)}
            </span>
            {incident.holdUntil ? <span>hold until {formatBriefdockTime(incident.holdUntil)}</span> : null}
            {incident.holder ? <span>holder {incident.holder}</span> : null}
          </div>
        </div>
        {incident.evidenceUrl ? (
          <a
            className="inline-flex items-center gap-1 border border-[#191714] px-3 py-2 text-sm"
            href={incident.evidenceUrl}
            rel="noreferrer"
            target="_blank"
          >
            evidence
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <input
          className="min-w-0 border border-[#191714] bg-white px-3 py-2"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Handoff note"
          value={note}
        />
        <Button
          className="bg-[#e4ff6a] text-[#191714] hover:bg-[#d1ef58]"
          disabled={isMutating || note.length < 3}
          onClick={async () => {
            await holdIncident(incident.id, 45, note)
            setNote('')
          }}
        >
          <Clock3 className="size-4" />
          hold 45m
        </Button>
        <Button
          className="bg-[#ff6f59] text-[#191714] hover:bg-[#ef604b]"
          disabled={isMutating || note.length < 3}
          onClick={async () => {
            await clearIncident(incident.id, note)
            setNote('')
          }}
        >
          <CheckCircle2 className="size-4" />
          clear
        </Button>
      </div>
    </article>
  )
}
