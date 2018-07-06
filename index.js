// The structure of this page is adapted from
// https://github.com/railsware/bozon, © Alex Chaplinsky, MIT Licence.
// var electron, path, pkg, jsonfile;
const path = require('path');
const pkg = require('./package.json');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const windowStateKeeper = require('electron-window-state');

try {
  require('electron-reloader')(module, {
    ignore: ["config.cson", "_scss/*"],
    debug: true
  });
} catch (err) {}

let mainWindow;

function createWindow() {
  let winState = windowStateKeeper({
    defaultWidth: 600,
    defaultHeight: 600
  });

  mainWindow = new BrowserWindow({
    title: pkg.appname,
    width: winState.width,
    height: winState.height,
    x: winState.x,
    y: winState.y,
    minWidth: 200,
    minHeight: 300,
    show: false
  });

  winState.manage(mainWindow);

  let mainContents = mainWindow.webContents;

  mainContents.on('did-finish-load', () => {
    mainContents.send('loaded', {
      appName: pkg.appname
    });
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);
