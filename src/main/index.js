import { app, BrowserWindow, ipcMain, Notification, Tray, Menu } from 'electron'
import * as timerService from './services/timer.services.js'
import * as activityService from './services/activity.services.js'
import path from 'node:path'

let win = null
let tray = null

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadURL('http://localhost:5173/')
}

function createTray() {
  const idleIcon = path.join(__dirname, '../../assets/stopwatch-white.png')
  const menuTemplate = [
    { label: 'Show', click: () => win.show() },
    { label: 'Quit', click: () => app.quit() }
  ]

  tray = new Tray(idleIcon)
  tray.setToolTip('Stopwatch')
  tray.setContextMenu(Menu.buildFromTemplate(menuTemplate))

  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show()
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  ipcMain.on('notify', (_e, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })

  ipcMain.on('timer-start', () => {
    timerService.start()
    activityService.start()
    const activeIcon = path.join(__dirname, '../../assets/stopwatch-red.png')
    tray.setImage(activeIcon)
  })

  ipcMain.on('timer-stop', () => {
    timerService.stop()
    activityService.stop()
    const idleIcon = path.join(__dirname, '../../assets/stopwatch-white.png')
    tray.setImage(idleIcon)
  })

  ipcMain.on('timer-reset', () => {
    timerService.reset()
    activityService.stop()
    const idleIcon = path.join(__dirname, '../../assets/stopwatch-white.png')
    tray.setImage(idleIcon)
  })
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
