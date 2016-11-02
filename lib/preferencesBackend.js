var jsonfile = require('jsonfile');
var themes = require(__dirname + '/themes.js');
// var usrConf = require(__dirname + '/config.user.json');

var prefsBackend = module.exports = {};

prefsBackend.saveUsrPrefs = function() {
    jsonfile.writeFile(__dirname + '/config.user.json', usrConfig, (err) => {
        if (err) {
            console.log(err.stack);
        } else {
            config.updateConfig( (data, userData) => {
                console.log(`data: ${JSON.stringify(data)}`);
                console.log(`usrConf: ${JSON.stringify(userData)}`);
                console.log("User config saved.");
            });
            // config = require(__dirname + '/config.js');
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
    usrConfig.theme = theme;
    prefsBackend.saveUsrPrefs();
}
