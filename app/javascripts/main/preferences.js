var themes = require('./javascripts/main/themes.js');
var prefsBackend = require('./javascripts/main/preferencesBackend.js')

var prefsHead = `<h1>Preferences</h1>
    <div class="form">`;
var prefsTheme = `
    <div class="form-group">
        <label>Select a theme:</label>
        <select class="form-control" type="text" id="theme-selection" onchange=prefsBackend.updateTheme()>
            ${themesHTML}
        </select>
    </div>`

var themesHTML = "";
for (let i = 0; i < themes.length; i++) {
    let label = Object.keys(themes)[i];
    themesHTML += `<option>${label}</option>`;
}
