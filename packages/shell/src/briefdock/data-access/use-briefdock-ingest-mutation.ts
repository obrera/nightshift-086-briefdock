import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ingestBriefdockChecks } from './briefdock-api.ts'

export function useBriefdockIngestMutation(token: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => ingestBriefdockChecks(token),
    onSuccess: (briefing) => {
      queryClient.setQueryData(['briefdock', 'briefing', token], briefing)
    },
  })
}
