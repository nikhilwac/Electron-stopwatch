import { useState, useEffect } from 'react'

function formatTime(totalSeconds) {
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const secs = String(totalSeconds % 60).padStart(2, '0')
  return `${hrs}:${mins}:${secs}`
}

export default function App() {
  const [elapsed, setElapsed] = useState(0)
  const [activityPercent, setActivityPercent] = useState(0)

  useEffect(() => {
    // 1) Listen for timer ticks from timer.service.js
    window.timerApi.onTick((seconds) => {
      setElapsed(seconds)
    })

    // 2) Listen for activity updates from activity.service.js
    window.activityApi.onActivityUpdate((percent) => {
      setActivityPercent(percent)
    })
  }, [])

  const handleStart = () => {
    window.timerApi.notify({ title: 'Stopwatch', body: 'Started' })
    window.timerApi.start()
  }

  const handleStop = () => {
    window.timerApi.stop()
    window.timerApi.notify({ title: 'Stopwatch', body: 'Stopped' })
  }

  const handleReset = () => {
    window.timerApi.reset()
    setElapsed(0) // ensure immediate UI reset
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', letterSpacing: '0.1em' }}>{formatTime(elapsed)}</h1>

      <div style={{ margin: '1rem 0' }}>
        <button onClick={handleStart} style={{ marginRight: '1rem' }}>
          Start
        </button>
        <button onClick={handleStop} style={{ marginRight: '1rem' }}>
          Stop
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <h2>User Activity: {activityPercent}% active in the last minute</h2>
    </div>
  )
}
