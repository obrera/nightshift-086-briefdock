import { Button } from '@workspace/ui/components/button'
import { KeyRound, RadioTower } from 'lucide-react'
import { useState } from 'react'
import type { Actor } from '../data-access/briefdock-api.ts'

export function BriefdockUiLogin({
  error,
  isPending,
  signIn,
}: {
  error: string | null
  isPending: boolean
  signIn: (actor: Actor, passcode: string) => Promise<void>
}) {
  const [actor, setActor] = useState<Actor>('obrera')
  const [passcode, setPasscode] = useState('')

  return (
    <main className="min-h-full bg-[#f4eedf] text-[#191714]">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-5 md:px-8 md:py-8">
        <section className="grid flex-1 gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 border border-[#191714] bg-[#e4ff6a] px-3 py-2 font-semibold text-xs uppercase tracking-[0.18em]">
              <RadioTower className="size-4" />
              missed automation handoff
            </div>
            <div className="max-w-2xl space-y-4">
              <h1 className="font-black text-5xl leading-[0.92] md:text-7xl">BriefDock</h1>
              <p className="max-w-xl text-[#4c463a] text-lg leading-7">
                A compact incident desk for turning failed scheduled work, stale repositories, and unresolved handoffs
                into timed holds with accountable actor traces.
              </p>
            </div>
            <div className="grid max-w-xl grid-cols-3 border border-[#191714] text-sm">
              <div className="bg-[#191714] p-3 text-[#f4eedf]">queue</div>
              <div className="border-[#191714] border-l p-3">timed holds</div>
              <div className="border-[#191714] border-l p-3">GitHub ingest</div>
            </div>
          </div>
          <form
            className="border-2 border-[#191714] bg-[#fffaf0] p-4 shadow-[10px_10px_0_#191714] md:p-6"
            onSubmit={(event) => {
              event.preventDefault()
              void signIn(actor, passcode)
            }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center bg-[#ff6f59] text-[#191714]">
                <KeyRound className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Operator sign-in</h2>
                <p className="text-[#6e6657] text-sm">Durable session, actor-stamped handoffs.</p>
              </div>
            </div>
            <label className="grid gap-2 text-sm">
              Actor
              <select
                className="border border-[#191714] bg-white px-3 py-3"
                onChange={(event) => setActor(event.target.value as Actor)}
                value={actor}
              >
                <option value="obrera">Obrera</option>
                <option value="bee">bee</option>
              </select>
            </label>
            <label className="mt-4 grid gap-2 text-sm">
              Passcode
              <input
                className="border border-[#191714] bg-white px-3 py-3"
                onChange={(event) => setPasscode(event.target.value)}
                type="password"
                value={passcode}
              />
            </label>
            {error ? <p className="mt-4 bg-[#ffe0d8] px-3 py-2 text-[#8b1d10] text-sm">{error}</p> : null}
            <Button className="mt-5 h-12 w-full bg-[#191714] text-[#fffaf0] hover:bg-[#3b352b]" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Open handoff desk'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
