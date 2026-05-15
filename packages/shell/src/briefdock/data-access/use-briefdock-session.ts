import { useCallback, useMemo, useState } from 'react'
import type { Actor, Session } from './briefdock-api.ts'

const storageKey = 'briefdock-session'

export function useBriefdockSession() {
  const [session, setSession] = useState<Session | null>(() => readSession())

  const saveSession = useCallback((nextSession: Session) => {
    window.localStorage.setItem(storageKey, JSON.stringify(nextSession))
    setSession(nextSession)
  }, [])

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(storageKey)
    setSession(null)
  }, [])

  return useMemo(
    () => ({
      actor: session?.actor ?? null,
      clearSession,
      saveSession,
      token: session?.token ?? null,
    }),
    [clearSession, saveSession, session],
  )
}

function readSession(): Session | null {
  const rawSession = window.localStorage.getItem(storageKey)
  if (!rawSession) {
    return null
  }

  try {
    const parsed = JSON.parse(rawSession) as Partial<Session>
    if ((parsed.actor === 'bee' || parsed.actor === 'obrera') && typeof parsed.token === 'string') {
      return { actor: parsed.actor as Actor, token: parsed.token }
    }
  } catch {
    window.localStorage.removeItem(storageKey)
  }

  return null
}
