var path = require('path');
var jsonfile = require('jsonfile');
var fs = require('fs');
var glob = require('glob');
var UUID = require('uuid-js');
var jsonexport = require('jsonexport');
// var remote = require('electron').remote;
const {dialog} = require('electron').remote;
var arrMember = require('array-member');
var tableify = require('tableify');
var Promise = require('bluebird');

var readjson = Promise.promisify(jsonfile.readFile);

var config, populate, gen, prefsBackend, prefs, submit, dataProc, forms,
  usrConf, themes;

var configPromise = new Promise((fulfill, reject) => {
  config = require(__dirname + '/lib/config.js');
  fulfill();
});
configPromise.then(() => {
  try {
    populate = require(__dirname + '/lib/populate.js');
    gen = require(__dirname + '/lib/makeForm.js');
    prefsBackend = require(__dirname + '/lib/preferencesBackend.js');
    prefs = require(__dirname + '/lib/preferences.js');
    submit = require(__dirname + '/lib/submit.js');
    dataProc = require(__dirname + '/lib/data.js');
    forms = require(__dirname + '/lib/forms.json');
    usrConfig = require(__dirname + '/lib/config.user.json');
    themes = require(__dirname + '/lib/themes.js');
  } catch (err) {
    console.log(err.stack);
  }
});

require('electron').ipcRenderer.on('loaded', function(event, incoming) {
  config.updateConfig( (incoming, userData) => {
    prefsBackend.applyTheme(incoming.theme);
    dataProc.getFields().then(populate.populate("home"));
  });
});
