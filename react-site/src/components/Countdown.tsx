import { useEffect, useState } from 'react'

interface Props {
  deadline: number
  onExpire: () => void
}

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, '0')
}

export default function Countdown({ deadline, onExpire }: Props) {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()))

  useEffect(() => {
    if (remaining <= 0) {
      onExpire()
      return
    }
    const id = setInterval(() => {
      const r = Math.max(0, deadline - Date.now())
      setRemaining(r)
      if (r <= 0) {
        clearInterval(id)
        onExpire()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [deadline, onExpire])

  const totalSeconds = remaining / 1000
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const warning = remaining > 0 && remaining < 6 * 3600 * 1000

  return (
    <div className={`reserved-countdown${warning ? ' reserved-countdown--warning' : ''}`}>
      <div className="reserved-countdown-block">
        <span className="reserved-countdown-value">{pad(hours)}</span>
        <span className="reserved-countdown-label">HEURES</span>
      </div>
      <span className="reserved-countdown-sep">:</span>
      <div className="reserved-countdown-block">
        <span className="reserved-countdown-value">{pad(minutes)}</span>
        <span className="reserved-countdown-label">MINUTES</span>
      </div>
      <span className="reserved-countdown-sep">:</span>
      <div className="reserved-countdown-block">
        <span className="reserved-countdown-value">{pad(seconds)}</span>
        <span className="reserved-countdown-label">SECONDES</span>
      </div>
    </div>
  )
}
