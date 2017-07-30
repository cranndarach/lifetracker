var exports = module.exports = {};
exports.config = {
  saveDir: require('path').join(__dirname, "..", "data"),
  theme: "dark"
};

function savePreferences() {
  writejson(__dirname + "/config.user.json", exports.userConfig)
    .then(() => {
      console.log("User preferences saved.");
      document.getElementById("save-prefs-message").innerHTML = "Preferences saved!";
    })
    .catch((err) => {
      console.log(err.stack);
      console.log("Could not save user preferences.");
    });
}

exports.updatePreferences = function() {
  return new Promise((resolve, reject) => {
    updateTheme();
    updateSaveDir();
    resolve("Updated");
  })
    .then(() => {
      savePreferences();
    });
};

// Is it better to make this a function and only create a promise at the end?
exports.loadUserConfig = new Promise((resolve, reject) => {
  readjson(__dirname + "/config.user.json")
    .then((userConfig) => {
      // exports.userConfig = userConfig;
      return Promise.all(Promise.each(Object.keys(userConfig), (key) => {
        exports.config[key] = userConfig[key];
      }))
        .then(() => {
          return new Promise.resolve(userConfig);
        });
    })
    // I know this is slightly redundant, but it's also clearer that this is
    // the resolution of the higher promise.
    .then((userConfig) => {
      resolve(userConfig);
    })
    .catch((err) => {
      console.log("No user config found.");
      // userConfig = {};
      resolve({});
    });
});

exports.selectSaveDir = function() {
  dialog.showOpenDialog({
    title: "Choose folder...",
    defaultPath: path.join(exports.config.saveDir, ".."),
    buttonLabel: "Select folder",
    properties: ["openDirectory"]
  }, (directory) => {
    document.getElementById("savedir").value = directory;
  });
};

exports.applyTheme = function() {
  let theme = exports.config.theme;
  let themePath = themes[theme];
  document.getElementById("theme").href = `stylesheets/${themePath}`;
};

// exports.updateTheme = function() {
function updateTheme() {
  let theme = document.getElementById("theme-selection").value;
  // let theme = themeElem.value;
  if (theme !== exports.config.theme) {
    exports.userConfig.theme = exports.config.theme = theme;
    exports.applyTheme();
    // savePreferences();
  }
}

function updateSaveDir() {
  let saveDir = document.getElementById("savedir").value;
  if (saveDir !== exports.config.saveDir) {
    exports.userConfig.saveDir = exports.config.saveDir = saveDir;
  }
}

// Run when loaded:
exports.loadUserConfig.then((userConfig) => {
  exports.userConfig = userConfig;
})
  .then(() => {
    console.log(`config: ${JSON.stringify(exports.config)}`);
    console.log(`user config: ${JSON.stringify(exports.userConfig)}`);
  });
