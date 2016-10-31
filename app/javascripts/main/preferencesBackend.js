var jsonfile = require('jsonfile');
var themes = require('./javascripts/main/themes.js');
var usrConf = require('./javascripts/main/usrConfig.js');

var prefsBackend = module.exports = {};

prefsBackend.saveUsrPrefs = function() {
    jsonfile.writeFile('./javascripts/main/usrConfig.js', usrConf, (err) => {
        if (err) {
            console.log(err.stack);
        } else {
            console.log("User config saved.");
        }
    });
}

// Use the path to the stylesheet as the href property in the link tag in index.html
// This function is called by ../renderer/application.js
prefsBackend.setTheme = function(theme) {
    let themePath = themes[theme];
    document.getElementById("theme").href = `stylesheets/${themePath}`;
}

prefsBackend.updateTheme = function() {
    let theme = document.getElementById("theme-selection").value;
    let themePath = themes[theme];
    document.getElementById("theme").href = `stylesheets/${themePath}`;
    usrConf.theme = theme;
    saveUsrPrefs();
}
