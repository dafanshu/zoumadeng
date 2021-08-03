// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain, webContents, Menu} = require('electron')
const path = require("path")
const fs = require("fs")
const extensions = ['jpg', 'png', 'gif', 'jpeg']
let minWin

function createMenu() {
  var template = [{
    label: "KanKan",
    submenu: [
      { label: 'exit', accelerator: "Esc", click: function () { app.quit() } },
      { type: 'separator' },
      {
        label: 'about',
        click: function () {
          app.showAboutPanel()
        }
      },
    ]
  },
  {
    label: 'file',
    submenu: [{
      label: 'open_file',
      accelerator: "CmdOrCtrl+O",
      click: function () {
        console.log('44444')
      }
    }, {
      label: 'new_window',
      accelerator: "CmdOrCtrl+N",
      click: function () {
        createWindow()
      }
    },]
  },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  //设置dock
  const dockMenu = Menu.buildFromTemplate([{
    label: 'new_window', //新窗口
    click() {
      //初始化空窗口
      console.log('44444')
    }
  }])
  app.dock.setMenu(dockMenu)
}

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  minWin = mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createMenu()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("toMain", (event, args) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: extensions }
    ]
  }).then(result => {
    if (result.canceled){
      return
    }
    console.log('mainWindow.id=', minWin.id)
    event.sender.send('invoke-js', result.filePaths)
  }).catch(err => {
    console.log(err)
  })
  // win.webContents.send("fromMain", responseObj);
});