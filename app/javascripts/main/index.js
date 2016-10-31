var electron, path, pkg, jsonfile; //, cson, fs;

path = require('path');
pkg = require('../../package.json');
electron = require('electron');
var config = require('./config.js');
// cson = require('fs-cson');
// fs = require('fs');
// jsonfile = require('jsonfile');

electron.app.on('ready', () => {
  var window;

  window = new electron.BrowserWindow({
    title: pkg.name,
    width: pkg.settings.width,
    height: pkg.settings.height
  });

  // jsonfile.readFile("./config.json", (err, obj) => {
  // // cson.readFile("./config.cson", (err, obj) => {
  //     if (err) {
  //         exports.config = {
  //             saveDir: "data",
  //             theme: "dark"
  //         };
  //         console.log(exports.config);
  //       //   let configString = cson.stringify(settings);
  //       //   cson.writeFile("./config.cson", settings, (err) => {
  //       jsonfile.writeFile("./config.json", settings, (err) => {
  //             if (err) {
  //                 console.log(err);
  //             } else {
  //                 console.log("Config file created.");
  //             }
  //         });
  //     } else {
  //         exports.config = obj;
  //         console.log("Config file loaded.");
  //     }
  // });


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
