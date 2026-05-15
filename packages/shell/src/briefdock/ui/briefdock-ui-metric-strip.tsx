import type { Briefing } from '../data-access/briefdock-api.ts'

export function BriefdockUiMetricStrip({ metrics }: { metrics: Briefing['metrics'] }) {
  const items = [
    ['open', metrics.open],
    ['held', metrics.held],
    ['overdue', metrics.overdue],
    ['cleared', metrics.cleared],
  ] as const

  return (
    <div className="grid grid-cols-2 border-2 border-[#191714] bg-[#fffaf0] md:grid-cols-4">
      {items.map(([label, value]) => (
        <div className="border-[#191714] border-b p-3 md:border-r md:border-b-0" key={label}>
          <div className="font-black text-3xl">{value}</div>
          <div className="text-[#625a4d] text-xs uppercase tracking-[0.16em]">{label}</div>
        </div>
      ))}
    </div>
  )
}
