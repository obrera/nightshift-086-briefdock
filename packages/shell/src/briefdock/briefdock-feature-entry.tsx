import { Button } from '@workspace/ui/components/button'
import { RefreshCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useBriefdockAuthMutation } from './data-access/use-briefdock-auth-mutation.ts'
import { useBriefdockBriefingQuery } from './data-access/use-briefdock-briefing-query.ts'
import { useBriefdockClearMutation } from './data-access/use-briefdock-clear-mutation.ts'
import { useBriefdockHoldMutation } from './data-access/use-briefdock-hold-mutation.ts'
import { useBriefdockIngestMutation } from './data-access/use-briefdock-ingest-mutation.ts'
import { useBriefdockSession } from './data-access/use-briefdock-session.ts'
import { BriefdockUiCheckList } from './ui/briefdock-ui-check-list.tsx'
import { BriefdockUiHandoffLog } from './ui/briefdock-ui-handoff-log.tsx'
import { BriefdockUiIncidentList } from './ui/briefdock-ui-incident-list.tsx'
import { BriefdockUiLogin } from './ui/briefdock-ui-login.tsx'
import { BriefdockUiMetricStrip } from './ui/briefdock-ui-metric-strip.tsx'

export function BriefdockFeatureEntry() {
  const { actor, clearSession, saveSession, token } = useBriefdockSession()
  const authMutation = useBriefdockAuthMutation()
  const [authError, setAuthError] = useState<string | null>(null)

  if (!token || !actor) {
    return (
      <BriefdockUiLogin
        error={authError}
        isPending={authMutation.isPending}
        signIn={async (nextActor, passcode) => {
          setAuthError(null)
          try {
            saveSession(await authMutation.mutateAsync({ actor: nextActor, passcode }))
          } catch {
            setAuthError('That passcode did not unlock the desk.')
          }
        }}
      />
    )
  }

  return <BriefdockFeatureDesk actor={actor} clearSession={clearSession} token={token} />
}

function BriefdockFeatureDesk({
  actor,
  clearSession,
  token,
}: {
  actor: string
  clearSession: () => void
  token: string
}) {
  const briefingQuery = useBriefdockBriefingQuery(token)
  const clearMutation = useBriefdockClearMutation(token)
  const holdMutation = useBriefdockHoldMutation(token)
  const ingestMutation = useBriefdockIngestMutation(token)
  const briefing = briefingQuery.data
  const isMutating = clearMutation.isPending || holdMutation.isPending || ingestMutation.isPending

  return (
    <main className="min-h-full bg-[#f4eedf] px-3 py-4 text-[#191714] md:px-6 md:py-6">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="grid gap-4 border-2 border-[#191714] bg-[#fffaf0] p-4 shadow-[8px_8px_0_#191714] md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 bg-[#191714] px-2 py-1 text-[#fffaf0] text-xs uppercase tracking-[0.16em]">
              <ShieldCheck className="size-3" />
              signed in as {actor}
            </div>
            <h1 className="font-black text-4xl leading-none">BriefDock</h1>
            <p className="mt-2 max-w-2xl text-[#655d50]">
              Timed holds, GitHub freshness checks, and accountable handoff notes for automation incidents.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-[#e4ff6a] text-[#191714] hover:bg-[#d1ef58]"
              disabled={isMutating}
              onClick={() => ingestMutation.mutate()}
            >
              <RefreshCcw className="size-4" />
              ingest GitHub
            </Button>
            <Button onClick={clearSession} variant="outline">
              sign out
            </Button>
          </div>
        </header>

        {briefingQuery.isLoading ? (
          <div className="border-2 border-[#191714] bg-[#fffaf0] p-5">Loading desk...</div>
        ) : null}
        {briefingQuery.isError ? (
          <div className="border-2 border-[#191714] bg-[#ffe0d8] p-5">Briefing failed. Sign out and try again.</div>
        ) : null}
        {briefing ? (
          <>
            <BriefdockUiMetricStrip metrics={briefing.metrics} />
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <BriefdockUiIncidentList
                clearIncident={async (incidentId, note) => {
                  await clearMutation.mutateAsync({ incidentId, note })
                }}
                holdIncident={async (incidentId, minutes, note) => {
                  await holdMutation.mutateAsync({ incidentId, minutes, note })
                }}
                incidents={briefing.incidents}
                isMutating={isMutating}
              />
              <div className="grid content-start gap-5">
                <BriefdockUiCheckList checks={briefing.checks} />
                <BriefdockUiHandoffLog handoffs={briefing.handoffs} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </main>
  )
}
