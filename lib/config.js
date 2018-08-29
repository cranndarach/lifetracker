var exports = module.exports = {};

var configHeader = `# Configuration file for LifeTracker.
# Edit this file to change your LifeTracker settings.
# To revert to the default settings, copy 'config-sample.cson' here.
`;
var sysConfigPath = path.join(__dirname, "..", "config.cson");
// vim doesn't like backticks, I guess.
var sysConfigHeader = "# System configuration file for LifeTracker.\n# The only reason to edit this file is to change the value of configDir.\n# Any other changes will be overwritten the next time you run LifeTracker.\n";

class ConfigError extends Error {
  constructor(conf, ...args) {
    super(...args);
    this.config = conf;
    this.code = "EBADCONFIG";
    Error.captureStackTrace(this, ConfigError);
  }
}

exports.makeDefaultConfig = function() {
  exports.makeDefaultPaths();
  exports.config = {
    theme: "dark",
    dataColumnOrder: ["startDate", "startTime", "endDate", "endTime", "whenDate", "whenTime", "title", "category"],
    saveDir: exports.defaultSaveDir
  };
  exports.system = {
    configDir: exports.defaultConfigDir
  };
};

exports.makeDefaultPaths = function() {
  let home = os.homedir();
  let configFilesDir, dataDir;
  // If Windows, save everything in Documents\LifeTracker. Otherwise, save
  // config files in ~/.config/lifetracker and data in ~/Documents/LifeTracker/data.
  if (process.platform === "win32") {
    let pfx = path.join(home, "Documents", "LifeTracker");
    exports.defaultConfigDir = path.join(pfx, "config");
    exports.defaultSaveDir = path.join(pfx, "data");
  } else {
    exports.defaultConfigDir = path.join(home, ".config", "lifetracker");
    exports.defaultSaveDir = path.join(home, "Documents", "LifeTracker", "data");
  }
};

// exports.makeConfigDirs = function() {
//   return Promise.join(makeConfigDir(exports.system.configDir), makeConfigDir(exports.config.saveDir), (configDir, saveDir) => {
//     return new Promise((resolve, reject) => {
//       resolve([configPath, dataPath]);
//     });
//   });
// }

function makeConfigDir(path) {
  // Makes the directories with mkdirp, but resolves to the path.
  return mkdirp.mkdirpAsync(path).then(() => {
    return new Promise((resolve, reject) => {
      resolve(path);
    });
  });
}

exports.loadSystemConfig = function() {
  // saveDir should go in the user config, not the system config.
  let sysConfigPath = path.join(__dirname, "..", "config.cson");
  return CSON.loadAsync(sysConfigPath)
    .then((sysConfig) => {
      return new Promise((resolve, reject) => {
        exports.system = sysConfig;
        // if (!sysConfig.configDir || !sysConfig.dataDir) {
        if (!sysConfig.configDir) {
          reject(new ConfigError(sysConfig));
        }
        resolve();
      })
    })
    .catch((err) => {
      if (err.code === "ENOENT" || err.code === "EBADCONFIG") {
        console.log(err.code);
        console.log("Making new system config.");
        // Needs to stay in this catch block; no need to write system config to file if it's already fine.
        return makeDefaultPaths()
          .then((paths) => {
            exports.system.configDir = exports.system.configDir || paths[0];
            // exports.system.dataDir = exports.system.dataDir || paths[1];
            let sysConfigString = sysConfigHeader + CSON.stringify(exports.system);
            return fs.writeFileAsync(sysConfigPath, sysConfigString);
          });
      } else {
        return new Promise((resolve, reject) => {
          reject(err);
        });
      }
    });
}

exports.loadUserConfig = function() {
  let configPath = path.join(exports.system.configDir, "config.cson");
  return new Promise((resolve, reject) => {
    return CSON.loadAsync(configPath)
      .then((userConfig) => {
        exports.userConfig = userConfig;
        // return applyUserValues(userConfig);
        _.assign(exports.config, exports.userConfig);
        resolve();
      })
      .catch((err) => {
        console.log(`No user config found at '${configPath}'. Treating as though empty.`);
        console.log("Stack:\n" + err.stack);
        // Treat userConfig as an empty Object.
        exports.userConfig = {};
        return savePreferences().then(resolve);
        // resolve();
      });
  });
};

function savePreferences() {
  let configPath = path.join(exports.system.configDir, "config.cson");
  var configString = CSON.stringify(exports.userConfig);
  let configContent = configHeader + configString;
  let sysConfigPath = path.join(__dirname, "..", "config.cson");
  let sysConfigString = sysConfigHeader + CSON.stringify(exports.system);
  let writeSysConfig = fs.writeFileAsync(sysConfigString);
  let writeUserConfig = fs.writeFileAsync(configPath, configContent);
  return Promise.join(writeSysConfig, writeUserConfig, () => { 
    console.log("Preferences saved.");
    let $target = $("#save-prefs-message");
    let selector = ".form-control";
    $target.text("Preferences saved!");
    $target.on("change", selector, (e) => {
      populate.clearMessage($target, selector, e);
    });
  })
    .catch((err) => {
      console.log(err.stack);
      console.log("Could not save preferences.");
    });
}

exports.updatePreferences = function() {
  return new Promise((resolve, reject) => {
    updateTheme();
    updateSaveDir();
    updateConfigDir();
    resolve("Updated");
  })
    .then(() => {
      savePreferences();
    });
};

exports.selectDir = function($elem, defaultPath) {
  dialog.showOpenDialog({
    title: "Choose folder...",
    defaultPath: defaultPath,
    buttonLabel: "Select folder",
    properties: ["openDirectory"]
  }, (directory) => {
    $elem.val(directory);
  });
};

exports.applyTheme = function() {
  let theme = exports.config.theme;
  let themePath = themes[theme];
  $("#theme").attr("href", `${themePath}`);
};

function updateTheme() {
  let theme = $("#theme-selection").val();
  if (theme !== exports.config.theme) {
    exports.userConfig.theme = exports.config.theme = theme;
    exports.applyTheme();
  }
}

function updateSaveDir() {
  let $elem = $("#savedir");
  let saveDir = $elem.val();
  if (saveDir !== exports.config.saveDir) {
    exports.userConfig.saveDir = exports.config.saveDir = saveDir;
    dataProc.loadData().then((data) => {
      // dataProc.getFields(data).then(console.log("Loaded fields."));
      dataProc.getCategories(data).then(console.log("Loaded categories."));
      // return Promise.join(dataProc.getFields(data), dataProc.getCategories(data) => {
      //
      // })
    });
  }
}

function updateSaveDir() {
  let $elem = $("#configdir");
  let configDir = $elem.val();
  if (configDir !== exports.system.configDir) {
    exports.system.configDir = configDir;
  }
}

// Run when loaded:
// exports.loadUserConfig.then((userConfig) => {
//   exports.userConfig = userConfig;
//   console.log(`user config: ${JSON.stringify(exports.userConfig)}`);
// });
