var exports = module.exports = {};
exports.config = {
  saveDir: require('path').join(__dirname, "..", "data"),
  theme: "dark"
};

function savePreferences() {
  // createCSON(exports.userConfig)
  var configString = CSON.stringify(exports.userConfig);
    // .then((csonString) => {
  fs.writeFile(__dirname + "/config.user.cson", configString, (err) => {
    if (err) {
      console.log(err.stack);
      console.log("Could not save user preferences.");
    } else {
      console.log("User preferences saved.");
      document.getElementById("save-prefs-message").innerHTML = "Preferences saved!";
    }
  });
    // })
    // .then(() => {
      // console.log("User preferences saved.");
      // document.getElementById("save-prefs-message").innerHTML = "Preferences saved!";
    // })
    // .catch((err) => {
      // console.log(err.stack);
      // console.log("Could not save user preferences.");
    // });
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
  CSON.load(__dirname + "/config.user.cson", (err, userConfig) => {
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
