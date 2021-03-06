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

var config, dataProc, explore, gen, populate, prefs, presets, submit, themes;
config = require(__dirname + "/lib/config.js");
themes = require(__dirname + "/lib/themes.js");
prefs = require(__dirname + "/lib/preferences.js");
populate = require(__dirname + "/lib/populate.js");
presets = require(__dirname + "/lib/presets.js");
dataProc = require(__dirname + "/lib/data.js");
edit = require(__dirname + "/lib/editEntry.js");
submit = require(__dirname + "/lib/submit.js");
gen = require(__dirname + "/lib/makeForm.js");
explore = require(__dirname + "/lib/explore.js");

config.makeDefaultConfig();
config.loadSystemConfig().then(() => {
  config.loadUserConfig();
  config.loadForms();
  config.loadPresets();
}).catch((err) => {
  console.log(err);
});

dataProc.loadData().then(() => {
  dataProc.makeKeys();
  dataProc.getCategories();
  window.categoriesLoaded = true;
}).catch((err) => {
  console.log(err);
});

$(document).on("userConfigLoaded", (e) => {
  config.applyTheme();
});

$(document).on("formsLoaded", (e) => {
  window.formsLoaded = true;
});

require("electron").ipcRenderer.on("loaded", function(event, incoming) {
  if (window.formsLoaded) {
    populate.fillSidebar();
  } else {
    $(document).on("formsLoaded", (e) => {
      populate.fillSidebar();
    });
  }

  if (window.categoriesLoaded) {
    populate.populate("home");
  } else {
    $(document).on("categoriesLoaded", (e) => {
      populate.populate("home");
    });
  }
});
