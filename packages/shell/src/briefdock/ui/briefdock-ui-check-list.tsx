import { ExternalLink, GitBranch } from 'lucide-react'
import type { RepoCheck } from '../data-access/briefdock-api.ts'
import { formatBriefdockTime } from '../util/briefdock-format.ts'

export function BriefdockUiCheckList({ checks }: { checks: RepoCheck[] }) {
  return (
    <section className="border-2 border-[#191714] bg-[#fffaf0]">
      <div className="flex items-center gap-2 border-[#191714] border-b p-3">
        <GitBranch className="size-4" />
        <h2 className="font-bold">GitHub checks</h2>
      </div>
      <div className="divide-y divide-[#191714]">
        {checks.map((check) => (
          <a
            className="grid gap-1 p-3 hover:bg-[#f4eedf] md:grid-cols-[1fr_auto]"
            href={check.url}
            key={check.id}
            rel="noreferrer"
            target="_blank"
          >
            <div>
              <div className="flex items-center gap-2 font-semibold">
                {check.repo}
                <ExternalLink className="size-3" />
              </div>
              <div className="text-[#655d50] text-sm">{check.summary}</div>
            </div>
            <div className="text-xs uppercase tracking-[0.14em]">
              {check.status} · {formatBriefdockTime(check.checkedAt)}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
