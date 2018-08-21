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
      // prefs.makePrefs();
      savePreferences();
    });
};

// Is it better to make this a function and only create a promise at the end?
exports.loadUserConfig = function() {
  return new Promise((resolve, reject) => {
    return CSON.loadAsync(path.join(__dirname, "..", "config.cson"))
      .then((userConfig) => {
        exports.userConfig = userConfig;
        // return applyUserValues(userConfig);
        _.assign(exports.config, exports.userConfig);
        resolve();
      })
      .catch((err) => {
        console.log("No user config found. Treating as though empty.");
        console.log("Stack:\n" + err.stack);
        // Treat userConfig as an empty Object.
        exports.userConfig = {};
        resolve();
      });
  });
};

// exports.configWarning = $("<p></p>", {
//   "id": "config-warning",
//   html: `It looks like you do not have your preferences set. It is <strong>strongly
//     recommended</strong> that you go over to "Preferences" and pick a folder to
//     store your data before you do anything else! Otherwise, any entries you
//     make might not be saved.`
// });
exports.configWarning = `<p>It looks like you do not have your preferences set.
  It is <strong>strongly
  recommended</strong> that you go over to "Preferences" and pick a folder to
  store your data before you do anything else! Otherwise, any entries you
  make might not be saved.</p>`;

// function applyUserValues(userConfig) {
//   return Promise.all(Promise.each(Object.keys(userConfig), (key) => {
//     exports.config[key] = userConfig[key];
//   }));
//   // .then(() => {
//   //   return new Promise.resolve(userConfig);
//   // });
// }

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
  // console.log(themePath);
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
  let saveDir = $("#savedir").val();
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

// Run when loaded:
// exports.loadUserConfig.then((userConfig) => {
//   exports.userConfig = userConfig;
//   console.log(`user config: ${JSON.stringify(exports.userConfig)}`);
// });
