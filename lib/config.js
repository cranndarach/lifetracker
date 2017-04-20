var exports = module.exports = {};
exports.config = {
  saveDir: require('path').join(__dirname, "..", "data"),
  theme: "dark",
  width: 950,
  height: 750
};

function savePreferences() {
  writejson(__dirname + "/config.user.json", exports.userConfig)
    .then(() => {
      console.log("User preferences saved.");
    })
    .catch((err) => {
      console.log(err.stack);
      console.log("Could not save user preferences.");
    });
}

// Is it better to make this a function and only create a promise at the end?
exports.applyUserConfig = new Promise((resolve, reject) => {
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

exports.applyTheme = function() {
  let theme = exports.config.theme;
  let themePath = themes[theme];
  document.getElementById("theme").href = `stylesheets/${themePath}`;
};

exports.updateTheme = function() {
  let themeElem = document.getElementById("theme-selection"); //.value;
  exports.userConfig.theme = exports.config.theme = themeElem.value;
  exports.applyTheme();
  savePreferences();
};

// exports.updateConfig = function(callback) {
//   jsonfile.readFile(__dirname + '/config.user.json', (err, userConfig) => {
//     if (err) {
//       userConfig = "No user config file found.";
//     } else {
//       for (let i = 0; i < Object.keys(userConfig).length; i++) {
//         let key = Object.keys(userConfig)[i];
//         exports.data[key] = userConfig[key];
//       }
//     }
//     callback(exports.data, userConfig);
//   });
// };
exports.applyUserConfig.then((userConfig) => {
  exports.userConfig = userConfig;
})
  .then(() => {
    console.log(`config: ${JSON.stringify(exports.config)}`);
    console.log(`user config: ${JSON.stringify(exports.userConfig)}`);
  });
