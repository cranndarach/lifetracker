var exports = module.exports = {
  forms: {},
  presets: {}
};

var configHeader = `# Configuration file for LifeTracker.
# Edit this file to change your LifeTracker settings.
# To revert to the default settings, copy 'config-sample.cson' here.
`;

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
    dateFormat: "MMMM DD, YYYY",
    twelveHour: true,
    timeFormat: "h:mm A",
    dataColumnOrder: ["startDate", "startTime", "endDate", "endTime", "whenDate", "whenTime", "title", "category"],
    saveDir: exports.defaultSaveDir
  };
  exports.system = {
    configDir: exports.defaultConfigDir
  };
};

exports.makeDefaultPaths = function() {
  let home = os.homedir();
  // If Windows, save everything in Documents\LifeTracker.
  // Otherwise, save config files in ~/.config/lifetracker and data in ~/Documents/LifeTracker/data.
  if (process.platform === "win32") {
    let pfx = path.join(home, "Documents", "LifeTracker");
    exports.defaultConfigDir = path.join(pfx, "config");
    exports.defaultSaveDir = path.join(pfx, "data");
  } else {
    exports.defaultConfigDir = path.join(home, ".config", "lifetracker");
    exports.defaultSaveDir = path.join(home, "Documents", "LifeTracker", "data");
  }
};

exports.loadSystemConfig = function() {
  let sysConfigPath = path.join(__dirname, "..", "system_config.cson");
  console.log(sysConfigPath);
  return CSON.loadAsync(sysConfigPath)
    .then((sysConfig) => {
      return new Promise((resolve, reject) => {
        if (!sysConfig.configDir) {
          reject(new ConfigError(sysConfig));
        } else {
          exports.system = sysConfig;
          resolve();
        }
      })
    })
    .catch((err) => {
      if (err.code === "ENOENT" || err.code === "EBADCONFIG") {
        console.log(err.code);
        // Default should already be set.
        if (err.config) { console.log(err.config); }
        console.log("Using default system config.");
        console.log(exports.system);
        let sysConfigString = sysConfigHeader + CSON.stringify(exports.system);
        return fs.writeFileAsync(sysConfigPath, sysConfigString);
      } else {
        return new Promise((resolve, reject) => {
          reject(err);
        });
      }
    })
    .then(() => {
      // Create user config directory if it doesn't already exist.
      return makeConfigDir(exports.system.configDir);
    });
}

exports.loadUserConfig = function() {
  let configPath = path.join(exports.system.configDir, "config.cson");
  return CSON.loadAsync(configPath)
    .then((userConfig) => {
      _.assign(exports.config, userConfig);
      return new Promise.resolve();
    })
    .catch((err) => {
      console.log(`No user config found at '${configPath}'. Treating as though empty.`);
      console.log("Stack:\n" + err.stack);
      return saveConfig();
    })
    .then(() => {
      // Create save directory if it doesn't already exist.
      return makeConfigDir(exports.config.saveDir);
    })
    .then(() => {
      $(document).trigger($.Event("userConfigLoaded"));
    });
};

exports.loadForms = function() {
  let formsPath = path.join(config.system.configDir, "forms.cson");
  return CSON.requireFileAsync(formsPath)
    .then((result) => {
      exports.forms = result;
      return new Promise.resolve();
    })
    .catch((err) => {
      if (err.code === "ENOENT") {
        return fs.copyFileAsync(path.join(__dirname, "..", "forms.cson"), formsPath)
          .then(() => {
            // Needs to stay in this block. Moving it outside would make the
            // successful case run again.
            return CSON.requireFileAsync(formsPath)
          })
          .then((result) => {
            exports.forms = result;
            return new Promise.resolve();
          });
      } else {
        throw err;
      }
    })
    .then(() => {
      $(document).trigger($.Event("formsLoaded"));
    });
};

exports.loadPresets = function() {
  return CSON.requireFileAsync(path.join(config.system.configDir, "presets.cson"))
    .then((result) => {
      exports.presets = result;
      console.log(exports.presets);
    })
    .catch((err) => {
      exports.presets = [];
      if (err.code === "ENOENT" || err instanceof SyntaxError) {
        console.log(err);
      } else {
        throw err;
      }
    })
    .then(() => {
      $(document).trigger($.Event("presetsLoaded"));
    });
};

exports.updatePreferences = function() {
  return new Promise((resolve, reject) => {
    updateTheme();
    updateDateFmt();
    updateTimeFmt();
    updateSaveDir();
    updateConfigDir();
    resolve("Updated");
  })
    .then(() => {
      saveConfig();
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

function makeConfigDir(path) {
  // Makes the directories with mkdirp, but resolves to the path.
  return mkdirp.mkdirpAsync(path).then(() => {
    return new Promise((resolve, reject) => {
      resolve(path);
    });
  });
}

function updateTheme() {
  let theme = $("#theme-selection").val();
  if (theme !== exports.config.theme) {
    // exports.userConfig.theme = exports.config.theme = theme;
    exports.config.theme = theme;
    exports.applyTheme();
  }
}

function updateDateFmt() {
  let fmt = $("#date-fmt").val();
  let formatted = moment().format(fmt);
  // Only save if it's a valid format.
  if (moment(formatted, fmt).isValid()) {
    exports.config.dateFormat = fmt;
  } else {
    console.log("Invalid date. Not saving.");
    console.log(fmt);
    console.log(formatted);
  }
}

function updateTimeFmt() {
  let checked = $("#twelve-hour").prop("checked");
  if (checked != exports.config.twelveHour) {
    exports.config.twelveHour = checked;
    exports.config.timeFormat = checked ? "h:mm A" : "HH:mm";
  }
}

function updateSaveDir() {
  let $elem = $("#savedir");
  let saveDir = $elem.val();
  if (saveDir !== exports.config.saveDir) {
    exports.config.saveDir = saveDir;
    dataProc.loadData().then((data) => {
      dataProc.getCategories(data).then(console.log("Loaded categories."));
    });
  }
}

function updateConfigDir() {
  let $elem = $("#configdir");
  let configDir = $elem.val();
  if (configDir !== exports.system.configDir) {
    exports.system.configDir = configDir;
  }
}

function saveConfig() {
  let configPath = path.join(exports.system.configDir, "config.cson");
  var configString = CSON.stringify(exports.config);
  let configContent = configHeader + configString;
  // let sysConfigPath = path.join(__dirname, "..", "config.cson");
  let sysConfigString = sysConfigHeader + CSON.stringify(exports.system);
  let writeSysConfig = fs.writeFileAsync(sysConfigPath, sysConfigString);
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
