var path = require('path');
var jsonfile = require('jsonfile');
var config = require(__dirname + '/lib/config.js');
try {
    var populate = require(__dirname + '/lib/populate.js');
    var gen = require(__dirname + '/lib/makeForm.js');
    var prefsBackend = require(__dirname + '/lib/preferencesBackend.js');
    var prefs = require(__dirname + '/lib/preferences.js');
    var submit = require(__dirname + '/lib/submit.js');
    var forms = require(__dirname + '/lib/forms.json');
    var usrConfig = require(__dirname + '/lib/config.user.json');
    var themes = require(__dirname + '/lib/themes.js');
} catch (err) {
    console.log(err.stack);
}

require('electron').ipcRenderer.on('loaded', function(event, data) {
    prefsBackend.setTheme(config.theme);
    populate.populate("home");
});
