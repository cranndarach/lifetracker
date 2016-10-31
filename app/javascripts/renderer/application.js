var path = require('path');
var jsonfile = require('jsonfile');
var config = require('../main/config.js');

require('electron').ipcRenderer.on('loaded', function(event, data) {
    setTheme(config.theme);
    populate("home");
});
