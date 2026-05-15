import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clearBriefdockIncident } from './briefdock-api.ts'

export function useBriefdockClearMutation(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ incidentId, note }: { incidentId: string; note: string }) =>
      clearBriefdockIncident({ incidentId, note, token }),
    onSuccess: (briefing) => {
      queryClient.setQueryData(['briefdock', 'briefing', token], briefing)
    },
  })
}
