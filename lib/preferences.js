var themes = require(__dirname + '/themes.js');
// var prefsBackend = require('./javascripts/main/preferencesBackend.js');

var exports = module.exports = {};

exports.themesHTML = "";
// exports.themes = themes;
// console.log(themes.length);
for (let i = 0; i < Object.keys(themes).length; i++) {
    let label = Object.keys(themes)[i];
    console.log(label);
    exports.themesHTML += `<option value="${label}">${label}</option>`;
}
console.log(exports.themesHTML);
var prefsHead = `<h1>Preferences</h1>
    <div class="form">`;
var prefsTheme = `
    <div class="form-group">
        <label>Select a theme:</label>
        <select class="form-control" type="text" id="theme-selection" onchange=prefsBackend.updateTheme()>
            ${exports.themesHTML}
        </select>
    </div>`;
var prefsFoot = `</div>`; // add a save button sometime maybe?

exports.prefsHTML = `
    ${prefsHead}
        ${prefsTheme}
    ${prefsFoot}`;
