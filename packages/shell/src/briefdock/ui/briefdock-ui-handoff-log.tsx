import type { Handoff } from '../data-access/briefdock-api.ts'
import { formatBriefdockTime } from '../util/briefdock-format.ts'

export function BriefdockUiHandoffLog({ handoffs }: { handoffs: Handoff[] }) {
  return (
    <section className="border-2 border-[#191714] bg-[#191714] text-[#fffaf0]">
      <h2 className="border-[#fffaf0] border-b p-3 font-bold">Actor trace</h2>
      <div className="divide-y divide-[#fffaf0]/30">
        {handoffs.length === 0 ? <div className="p-3 text-[#cfc5ae]">No handoff actions yet.</div> : null}
        {handoffs.map((handoff) => (
          <div className="grid gap-1 p-3" key={handoff.id}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="bg-[#e4ff6a] px-2 py-1 text-[#191714]">{handoff.actor}</span>
              <span>{handoff.action}</span>
              <span className="text-[#cfc5ae]">{formatBriefdockTime(handoff.createdAt)}</span>
            </div>
            <p className="text-[#fffaf0] text-sm">{handoff.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
