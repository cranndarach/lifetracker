var exports = module.exports = {};
exports.config = {
  saveDir: path.join(__dirname, "..", "data"),
  theme: "dark"
};

function savePreferences() {
  var configString = CSON.stringify(exports.userConfig);
  fs.writeFile(path.join(__dirname, "..", "config.cson"), configString, (err) => {
    if (err) {
      console.log(err.stack);
      console.log("Could not save user preferences.");
    } else {
      console.log("User preferences saved.");
      document.getElementById("save-prefs-message").innerHTML = "Preferences saved!";
    }
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
  // loadCSON(__dirname + "/config.user.cson")
  CSON.load(path.join(__dirname, "..", "config.cson"), (err, userConfig) => {
    // .then((userConfig) => {
    if (err) {
      console.log(err.stack);
    }
    return applyUserValues(userConfig)
    // })
      .then(() => {
        // Once the config has been updated with user values, resolve the Promise.
        resolve(userConfig);
      })
      .catch((err) => {
        console.log("Reached a catch: No user config found.");
        console.log("Stack:\n" + err.stack);
        // Treat userConfig as an empty Object.
        resolve({});
      });
  });
});

function applyUserValues(userConfig) {
  return Promise.all(Promise.each(Object.keys(userConfig), (key) => {
    exports.config[key] = userConfig[key];
  }));
  // .then(() => {
  //   return new Promise.resolve(userConfig);
  // });
}

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
    dataProc.loadData().then((data) => {
      dataProc.getFields(data).then(console.log("Loaded fields."));
      dataProc.getCategories(data).then(console.log("Loaded categories."));
      // return Promise.join(dataProc.getFields(data), dataProc.getCategories(data) => {
      //
      // })
    });
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
