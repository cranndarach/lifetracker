const path = require('path');
const CSON = require('cson');
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
var loadCSON = Promise.promisify(CSON.load);
var createCSON = Promise.promisify(CSON.createCSONString);
var writeFile = Promise.promisify(fs.writeFile);
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

require('electron').ipcRenderer.on('loaded', function(event, incoming) {
  requirePromise("config").then((mod) => {
    config = mod;
    // Promise:
    return config.applyUserConfig;
  })
    .then(() => {
      config.applyTheme();
      prefs = require(__dirname + '/lib/preferences.js');

      requirePromise("data")
        .then((mod) => {
          dataProc = mod;
          // return dataProc.getFields();
          return dataProc.loadData();
        })
        .then((d) => {
          return Promise.join(dataProc.getFields(d), dataProc.getCategories(d), () => {
            // dataProc.makeCategoryOptions();
            populate.populate("home");
          });
          // dataProc.getCategories();
        })
        .catch((err) => {
          console.log(err.stack);
        });
    })
    .catch((err) => {
      console.log(err.stack);
    });
});
