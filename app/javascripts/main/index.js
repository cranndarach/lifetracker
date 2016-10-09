var electron, path, pkg, jsonfile;

path = require('path');
pkg = require('../../package.json');
electron = require('electron');
jsonfile = require('jsonfile');

electron.app.on('ready', () => {
  var window;

  window = new electron.BrowserWindow({
    title: pkg.name,
    width: pkg.settings.width,
    height: pkg.settings.height
  });

  jsonfile.readFile("../../settings.json", (err, obj) => {
      if (err) {
          let settings = {
              saveDir: "data",
              theme: "dark"
          };
          console.log(settings);
          jsonfile.writeFile("../../settings.json", settings, (err) => {
              if (err) {
                  console.log(err);
              } else {
                  console.log("Settings set.");
              }
          });
      } else {
          console.log("Settings found.");
      }
  });


  window.webContents.on('did-finish-load', () => {
    window.webContents.send('loaded', {
      appName: pkg.name
    });
  });

  window.loadURL('file://' + path.join(__dirname, '..', '..') + '/index.html');

  window.on('closed', () => {
    window = null;
  });

});
