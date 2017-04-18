// The structure of this page is adapted from
// https://github.com/railsware/bozon, © Alex Chaplinsky, MIT Licence.
// var electron, path, pkg, jsonfile;
const path = require('path');
const pkg = require('./package.json');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var config = require('./lib/config.js');

app.on('ready', () => {
  var window;

  window = new BrowserWindow({
    title: pkg.appname,
    width: config.data.width,
    height: config.data.height
  });

  // window.maximize();
  // window.openDevTools();

  window.webContents.on('did-finish-load', () => {
    window.webContents.send('loaded', {
      appName: pkg.appname
    });
  });

  window.loadURL('file://' + path.join(__dirname) + '/index.html');

  window.on('closed', () => {
    window = null;
  });

});
