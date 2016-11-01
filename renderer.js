var path = require('path');
var jsonfile = require('jsonfile');
var config = require(__dirname + '/lib/config.js');
try {
    var populate = require(__dirname + '/lib/populate.js');
    var prefsBackend = require(__dirname + '/lib/preferencesBackend.js');
} catch (err) {
    console.log(err.stack);
}

require('electron').ipcRenderer.on('loaded', function(event, data) {
    prefsBackend.setTheme(config.theme);
    populate.populate("home");
});
