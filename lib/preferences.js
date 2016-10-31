try {
    console.log(__dirname);
    var themes = require(__dirname + '/javascripts/main/themes.js');
} catch (err) {
    console.log(err.stack);
}
// var prefsBackend = require('./javascripts/main/preferencesBackend.js');

var exports = module.exports = {};

var prefsHead = `<h1>Preferences</h1>
    <div class="form">`;
var prefsTheme = `
    <div class="form-group">
        <label>Select a theme:</label>
        <select class="form-control" type="text" id="theme-selection" onchange=prefsBackend.updateTheme()>
            ${themesHTML}
        </select>
    </div>`;
var prefsFoot = `</div>`; // add a save button sometime maybe?

var themesHTML = "";
for (let i = 0; i < exports.themes.length; i++) {
    let label = Object.keys(themes)[i];
    exports.themesHTML += `<option>${label}</option>`;
}

exports.prefsHTML = `
    ${prefsHead}
        ${prefsTheme}
    ${prefsFoot}`;
