import { useQuery } from '@tanstack/react-query'
import { getBriefdockBriefing } from './briefdock-api.ts'

export function useBriefdockBriefingQuery(token: string) {
  return useQuery({
    queryFn: () => getBriefdockBriefing(token),
    queryKey: ['briefdock', 'briefing', token],
    refetchInterval: 30_000,
  })
}
