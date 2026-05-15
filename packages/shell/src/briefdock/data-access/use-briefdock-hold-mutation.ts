import { useMutation, useQueryClient } from '@tanstack/react-query'
import { holdBriefdockIncident } from './briefdock-api.ts'

export function useBriefdockHoldMutation(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ incidentId, minutes, note }: { incidentId: string; minutes: number; note: string }) =>
      holdBriefdockIncident({ incidentId, minutes, note, token }),
    onSuccess: (briefing) => {
      queryClient.setQueryData(['briefdock', 'briefing', token], briefing)
    },
  })
}
