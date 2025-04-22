import { BrowserWindow } from 'electron'
import robot from 'robotjs'

let checkInterval = null
let reportInterval = null
let lastActivity = Date.now()
let activeSeconds = 0

function emitUpdate(pct) {
  const win = BrowserWindow.getAllWindows()[0]
  win?.webContents.send('activity-update', pct.toFixed(2))
}

export function start() {
  if (checkInterval) return
  activeSeconds = 0
  lastActivity = Date.now()
  let lastPos = robot.getMousePos()

  checkInterval = setInterval(() => {
    const now = Date.now()
    const pos = robot.getMousePos()
    if (now - lastActivity < 1000 || pos.x !== lastPos.x || pos.y !== lastPos.y) {
      activeSeconds++
    }
    lastPos = pos
  }, 1000)

  reportInterval = setInterval(() => {
    emitUpdate((activeSeconds / 60) * 100)
    activeSeconds = 0
  }, 60000)
}

export function stop() {
  clearInterval(checkInterval)
  clearInterval(reportInterval)
  checkInterval = reportInterval = null
  activeSeconds = 0
}
