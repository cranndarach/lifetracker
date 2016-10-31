var path = require('path');
var jsonfile = require('jsonfile');
var config = require('../main/config.js');
try {
    var populate = require('../main/populate.js');
    var prefsBackend = require('../main/preferencesBackend.js');
} catch (err) {
    console.log(err.stack);
}

require('electron').ipcRenderer.on('loaded', function(event, data) {
    prefsBackend.setTheme(config.theme);
    populate.populate("home");
});
