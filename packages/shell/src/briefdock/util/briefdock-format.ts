export function formatBriefdockTime(value: string | null) {
  if (!value) {
    return 'none'
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value))
}

export function formatBriefdockCountdown(value: string) {
  const minutes = Math.round((Date.parse(value) - Date.now()) / 60_000)
  if (minutes < 0) {
    return `${Math.abs(minutes)}m overdue`
  }

  return `${minutes}m left`
}
