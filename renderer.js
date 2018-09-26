const _ = require("lodash");
const os = require("os");
const path = require("path");
const jsonfile = require("jsonfile");
const jsonexport = require("jsonexport");
const CSON = require("cson");
const fs = require("fs");
const glob = require("glob");
const mkdirp = require("mkdirp");
const UUID = require("uuid-js");
const {dialog} = require("electron").remote;
const {shell} = require("electron");
const moment = require("moment");
var Promise = require("bluebird");

Promise.promisifyAll(fs);
Promise.promisifyAll(jsonfile);
// Promise.promisifyAll(jsonexport);
Promise.promisifyAll(CSON);
Promise.promisifyAll(mkdirp);
Promise.promisifyAll(glob);
// Promise.promisifyAll(dialog);

function requirePromise(mod) {
  return new Promise((resolve, reject) => {
    resolve(require(`${__dirname}/lib/${mod}.js`));
  });
}

var config, populate, gen, prefs, submit, dataProc, themes, presets;
// These ones are all either independent or probably won't cause problems
// and can be loaded asynchronously.
themes = require(__dirname + '/lib/themes.js');
edit = require(__dirname + "/lib/editEntry.js");
submit = require(__dirname + '/lib/submit.js');
gen = require(__dirname + '/lib/makeForm.js');

require('electron').ipcRenderer.on('loaded', function(event, incoming) {
  requirePromise("config").then((mod) => {
    config = mod;
    config.makeDefaultConfig();
    return config.loadSystemConfig();
  })
    .then(() => {
      return Promise.join(config.loadUserConfig(), config.loadForms(), config.loadPresets(), () => {
        return new Promise.resolve();
      });
    })
    .then(() => {
      populate = require(__dirname + '/lib/populate.js');
      presets = require(__dirname + "/lib/presets.js");
      prefs = require(__dirname + '/lib/preferences.js');
      config.applyTheme();
      populate.fillSidebar();
      return requirePromise("data");
    })
    .then((mod) => {
      dataProc = mod;
      return dataProc.loadData();
    })
    .then(() => {
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
