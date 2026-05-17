import { useState, useEffect } from 'react'

export function useCountdown(finishedAt: string) {
  const getTimeLeft = () => {
    const diff = new Date(finishedAt.replace(' ', 'T')).getTime() - Date.now()
    if (diff <= 0) return null

    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    return { hours, minutes, seconds, diff }
  }

  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft()
      setTimeLeft(t)
      if (!t) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [finishedAt])

  return timeLeft
}