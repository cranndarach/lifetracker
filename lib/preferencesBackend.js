var exports = module.exports = {};

// exports.savePreferences = function() {
function savePreferences() {
  writejson(__dirname + "/config.user.json", config.userConfig)
    .then(() => {
      console.log("User preferences saved.");
    })
    .catch((err) => {
      console.log(err.stack);
      console.log("Could not save user preferences.");
    });
}

// Use the path to the stylesheet as the href property in the link tag in index.html
exports.applyTheme = function(theme) {
  let themePath = themes[theme];
  console.log(themePath);
  document.getElementById("theme").href = `stylesheets/${themePath}`;
};

exports.updateThemeConfig = function() {
  let themeElem = document.getElementById("theme-selection"); //.value;
  exports.applyTheme(themeElem.value);
  config.userConfig.theme = themeElem.value;
  // I don't think it should also need to update the overall config right now,
  // but that can be added if needed.
  savePreferences();
};
