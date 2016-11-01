var electron, path, pkg, jsonfile;

path = require('path');
pkg = require('./package.json');
electron = require('electron');
var config = require('./lib/config.js');

electron.app.on('ready', () => {
  var window;

  window = new electron.BrowserWindow({
    title: pkg.appname,
    width: config.width,
    height: config.height
  });

  window.maximize();
  window.openDevTools();

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
