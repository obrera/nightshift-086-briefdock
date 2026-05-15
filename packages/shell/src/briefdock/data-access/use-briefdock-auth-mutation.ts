import { useMutation } from '@tanstack/react-query'
import { type Actor, createBriefdockSession } from './briefdock-api.ts'

export function useBriefdockAuthMutation() {
  return useMutation({
    mutationFn: ({ actor, passcode }: { actor: Actor; passcode: string }) => createBriefdockSession(actor, passcode),
  })
}
