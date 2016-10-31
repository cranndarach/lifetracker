var jsonfile = require('jsonfile');
var themes;
try {
    themes = require('./javascripts/main/themes.js');
} catch (err) {
    console.log(err.stack);
}

// Use the path to the stylesheet as the href property in the link tag in index.html
// This function is called by ../renderer/application.js
function setTheme(theme) {
    let themePath = themes[theme];
    document.getElementById("theme").href = `stylesheets/${themePath}`;
}
