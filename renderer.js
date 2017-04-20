const path = require('path');
const jsonfile = require('jsonfile');
const fs = require('fs');
const glob = require('glob');
const UUID = require('uuid-js');
const jsonexport = require('jsonexport');
const {dialog} = require('electron').remote;
const arrMember = require('array-member');
const tableify = require('tableify');
var Promise = require('bluebird');

var readjson = Promise.promisify(jsonfile.readFile);
var writejson = Promise.promisify(jsonfile.writeFile);
function requirePromise(mod) {
  return new Promise((resolve, reject) => {
    resolve(require(`${__dirname}/lib/${mod}.js`));
  });
}

var config, populate, gen, prefsBackend, prefs, submit, dataProc, forms,
  usrConf, themes;
// These ones are all either independent or probably won't cause problems
// and can be loaded asynchronously.
themes = require(__dirname + '/lib/themes.js');
submit = require(__dirname + '/lib/submit.js');
forms = require(__dirname + '/lib/forms.json');
populate = require(__dirname + '/lib/populate.js');
gen = require(__dirname + '/lib/makeForm.js');

// When loaded:
require('electron').ipcRenderer.on('loaded', function(event, incoming) {
  // Config is required by the following modules, so it needs to be definitely
  // loaded before they are.
  requirePromise("config").then((mod) => {
    config = mod;
    return config.applyUserConfig;
  })
  // Preferences chain:
    .then(() => {
      // requirePromise("preferencesBackend")
      //   .then((mod) => {
      //     return new Promise((resolve, reject) => {
      //       prefsBackend = mod;
      //       resolve(console.log("Loaded prefsBackend"));
      //     });
      //   })
        // .then(() => {
      config.applyTheme();
      prefs = require(__dirname + '/lib/preferences.js');
        // })

      // dataProc chain:
      requirePromise("data")
        .then((mod) => {
          dataProc = mod;
          return dataProc.getFields();
        })
        .then(populate.populate("home"));
    })
    .catch((err) => {
      console.log(err.stack);
    });
});
