
const electron = require('electron');
const url = require('url');
const path = require('path');
//const glob = require('glob');


var {app,BrowserWindow, Menu} = electron;


const debug = /--debug/.test(process.argv[2]);
if (process.mainModule) app.setName('BPA');

let mainWindow:any;

function initialize () {
  //const shouldQuit = makeSingleInstance()
  //if (shouldQuit) return app.quit()

  loadDependep()

  function createWindow () {
    const windowOptions = {
      width: 800,
      minWidth: 680,
      height: 600,
      title: app.getName(),
      icon:''
    }


    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(path.join('file://', __dirname, '/mainWindow.html'))

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools()
      mainWindow.maximize()
      require('devtron').install()
    }

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', () => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}



// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
// function makeSingleInstance () {
//   if (process.mainModule) return false

//   return app.makeSingleInstance(() => {
//     if (mainWindow) {
//       if (mainWindow.isMinimized()) mainWindow.restore()
//       mainWindow.focus()
//     }
//   })
// }

// Require each JS file in the main-process dir
function loadDependep () {
  //const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  //files.forEach((file) => { require(file) })
}
initialize();