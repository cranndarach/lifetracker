var path = require('path');
// var cson = require('fs-cson');
var jsonfile = require('jsonfile');
var config = require('../main/config.js');
// var config, themes;

require('electron').ipcRenderer.on('loaded', function(event, data) {
    // cson.readFile('config.cson', (err, data) => {
    // jsonfile.readFile('./config.json', (err, config) => {
    //     if (err) {
    //         console.log(err);
    //     }
    //     setTheme(config.theme);
    //     populate("home");
    // })

    setTheme(config.theme);
});
