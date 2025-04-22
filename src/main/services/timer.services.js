import { BrowserWindow } from 'electron'

let elapsed = 0
let timerInterval = null

function emitTick() {
  const win = BrowserWindow.getAllWindows()[0]
  if (win?.webContents) {
    win.webContents.send('timer-tick', elapsed)
  }
}

export const start = () => {
  if (timerInterval) return
  elapsed = 0
  timerInterval = setInterval(() => {
    elapsed++
    emitTick()
  }, 1000)
}

export const stop = () => {
  if (!timerInterval) return
  clearInterval(timerInterval)
  timerInterval = null
}

export const reset = () => {
  clearInterval(timerInterval)
  timerInterval = null
  elapsed = 0
  emitTick()
}
