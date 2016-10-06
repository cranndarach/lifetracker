var electron, path, pkg;

path = require('path');
pkg = require('../../package.json');

electron = require('electron');

electron.app.on('ready', function() {
  var window;

  window = new electron.BrowserWindow({
    title: pkg.name,
    width: pkg.settings.width,
    height: pkg.settings.height
  });

  // window.$ = window.jQuery = require('jquery');

  window.loadURL('file://' + path.join(__dirname, '..', '..') + '/index.html');

  // window.webContents.on('did-finish-load', function(){
  //   window.webContents.send('loaded', {
  //     appName: pkg.name,
  //     electronVersion: process.versions.electron,
  //     nodeVersion: process.versions.node,
  //     chromiumVersion: process.versions.chrome
  //   });
  // });

  window.on('closed', function() {
    window = null;
  });

});
