const _ = require("lodash");
const os = require("os");
const path = require("path");
const jsonfile = require("jsonfile");
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
Promise.promisifyAll(CSON);
Promise.promisifyAll(mkdirp);
Promise.promisifyAll(glob);
// fs.copyFile doesn't seem to promisify nicely.
// var copyFile = Promise.promisify(fs.copyFile);
// var CSON = Promise.promisifyAll(require('cson'));
// var readjson = Promise.promisify(jsonfile.readFile);
// var writejson = Promise.promisify(jsonfile.writeFile);
// var loadCSON = Promise.promisify(CSON.load);
// var createCSON = Promise.promisify(CSON.createCSONString);
// var writeFile = Promise.promisify(fs.writeFile);
function requirePromise(mod) {
  return new Promise((resolve, reject) => {
    resolve(require(`${__dirname}/lib/${mod}.js`));
  });
}

var config, populate, gen, prefs, submit, dataProc, themes, presets;
// These ones are all either independent or probably won't cause problems
// and can be loaded asynchronously.
themes = require(__dirname + '/lib/themes.js');
// The preset entries are loaded in the presets module.
submit = require(__dirname + '/lib/submit.js');
gen = require(__dirname + '/lib/makeForm.js');

require('electron').ipcRenderer.on('loaded', function(event, incoming) {
  requirePromise("config").then((mod) => {
    config = mod;
    config.makeDefaultConfig();
    return config.loadSystemConfig();
    // return Promise.join(config.loadUserConfig(), config.loadSystemConfig(), () => { return new Promise.resolve(); });
  })
    .then(() => {
      // return config.loadUserConfig();
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
