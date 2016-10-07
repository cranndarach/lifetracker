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

  window.loadURL('file://' + path.join(__dirname, '..', '..') + '/index.html');

  window.on('closed', function() {
    window = null;
  });

});
