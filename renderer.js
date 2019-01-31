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

var config = require(__dirname + "/lib/config.js");
var themes = require(__dirname + "/lib/themes.js");
var prefs = require(__dirname + "/lib/preferences.js");
var populate = require(__dirname + "/lib/populate.js");
var presets = require(__dirname + "/lib/presets.js");
var dataProc = require(__dirname + "/lib/data.js");
var edit = require(__dirname + "/lib/editEntry.js");
var submit = require(__dirname + "/lib/submit.js");
var gen = require(__dirname + "/lib/makeForm.js");
var explore = require(__dirname + "/lib/explore.js");

config.makeDefaultConfig();
config.loadSystemConfig().then(() => {
  // These things rely on the config. Only the data needs to be finished before
  // the next steps.
  config.loadUserConfig();
  config.loadForms();
  config.loadPresets();
  return dataProc.loadData();
}).then(() => {
  dataProc.makeKeys();
  dataProc.getCategories();
}).catch((err) => {
  console.log(err);
});

// dataProc.loadData().then(() => {
//   dataProc.makeKeys();
//   dataProc.getCategories();
//   // window.categoriesLoaded = true;
// }).catch((err) => {
//   console.log(err);
// });

$(document).on("userConfigLoaded", (e) => {
  console.log("handling user config loaded");
  config.applyTheme();
});

// $(document).on("formsLoaded", (e) => {
//   console.log("handling forms loaded");
//   window.formsLoaded = true;
// });
//
// $(document).on("presetsLoaded", (e) => {
//   console.log("handling presets loaded");
//   window.presetsLoaded = true;
// });

require("electron").ipcRenderer.on("loaded", function(event, incoming) {
  // First make it with whatever exists.
  populate.fillSidebar();

  // "one" isn't a typo. Only handle once.
  $(document).one("formsLoaded", (e) => {
    populate.updateSidebarForms();
  });

  $(document).one("presetsLoaded", (e) => {
    populate.updateSidebarPresets();
  });
  // if (window.formsLoaded) {
  //   if (window.presetsLoaded) {
  //     populate.fillSidebar();
  //   } else {
  //     $(document).on("presetsLoaded", (e) => {
  //       console.log("handling presets loaded");
  //       window.presetsLoaded = true;
  //       populate.fillSidebar();
  //     });
  //   }
  // } else {
  //   $(document).on("formsLoaded", (e) => {
  //     console.log("handling forms loaded");
  //     if (window.presetsLoaded) {
  //       populate.fillSidebar();
  //     } else {
  //       $(document).on("presetsLoaded", (e) => {
  //         console.log("handling presets loaded");
  //         window.presetsLoaded = true;
  //         populate.fillSidebar();
  //       });
  //     }
  //   });
  // }

  populate.populate("home");

  // if (window.categoriesLoaded) {
  //   populate.populate("home");
  // } else {
  //   $(document).on("categoriesLoaded", (e) => {
  //     console.log("handling categoriesLoaded");
  //     populate.populate("home");
  //   });
  // }
});
