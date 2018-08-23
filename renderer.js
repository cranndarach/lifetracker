const _ = require("lodash");
const path = require('path');
const jsonfile = require('jsonfile');
const fs = require('fs');
const glob = require('glob');
const UUID = require('uuid-js');
const jsonexport = require('jsonexport');
const {dialog} = require('electron').remote;
const moment = require('moment');
var Promise = require('bluebird');

var CSON = Promise.promisifyAll(require('cson'));
var readjson = Promise.promisify(jsonfile.readFile);
var writejson = Promise.promisify(jsonfile.writeFile);
// var loadCSON = Promise.promisify(CSON.load);
// var createCSON = Promise.promisify(CSON.createCSONString);
var writeFile = Promise.promisify(fs.writeFile);
function requirePromise(mod) {
  return new Promise((resolve, reject) => {
    resolve(require(`${__dirname}/lib/${mod}.js`));
  });
}

var config, populate, gen, prefsBackend, prefs, submit, dataProc, forms,
  usrConf, themes, presets;
// These ones are all either independent or probably won't cause problems
// and can be loaded asynchronously.
themes = require(__dirname + '/lib/themes.js');
submit = require(__dirname + '/lib/submit.js');
// forms = require(__dirname + '/forms.cson');
forms = CSON.requireFile(__dirname + "/forms.cson");
presets = require(__dirname + "/lib/presets.js");
populate = require(__dirname + '/lib/populate.js');
gen = require(__dirname + '/lib/makeForm.js');

require('electron').ipcRenderer.on('loaded', function(event, incoming) {
  populate.fillSidebar();
  requirePromise("config").then((mod) => {
    config = mod;
    // Promise:
    return config.loadUserConfig();
  })
    .then(() => {
      config.applyTheme();
      prefs = require(__dirname + '/lib/preferences.js');
      return requirePromise("data");
    })
    .then((mod) => {
      dataProc = mod;
      return dataProc.loadData();
    })
    .then(() => {
      // return Promise.join(dataProc.getFields(), dataProc.getCategories(), () => {
      dataProc.makeKeys();
      return dataProc.getCategories();
    })
    .then(() => {
      populate.populate("home");
    })
    .catch((err) => {
      console.log(err.stack);
    });
});
