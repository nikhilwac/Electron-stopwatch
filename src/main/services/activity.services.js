import fs from 'node:fs'
import { BrowserWindow } from 'electron'

let rawStream = null
let secondInterval = null
let reportInterval = null
let sawMovementThisSecond = false
let activeSeconds = 0

function emitupdate(pct) {
  const win = BrowserWindow.getAllWindows()[0]
  win?.webContents.send('activity-update', pct.toFixed(2))
}

function onData(chunck) {
  for (let i = 0; i + 2 < chunck.length; i += 3) {
    const dx = chunck[i + 1]
    const dy = chunck[i + 2]
    if (dx !== 0 || dy !== 0) {
      sawMovementThisSecond = true
      break
    }
  }
}

export function start() {
  if (rawStream) return

  rawStream = fs
    .createReadStream('/dev/input/mice')
    .on('data', onData)
    .on('error', (err) => console.error('Raw mouse error', err))

  sawMovementThisSecond = false
  activeSeconds = 0

  secondInterval = setInterval(() => {
    if (sawMovementThisSecond) activeSeconds++
    sawMovementThisSecond = false
  }, 1000)

  reportInterval = setInterval(() => {
    const pct = (activeSeconds / 60) * 100
    emitupdate(pct)
    activeSeconds = 0
  }, 60000)
}

export function stop() {
  rawStream?.destroy()
  rawStream = null
  clearInterval(secondInterval)
  clearInterval(reportInterval)
  secondInterval = reportInterval = null
  sawMovementThisSecond = false
}
