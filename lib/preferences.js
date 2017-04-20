var exports = module.exports = {};
var prefsHead = `<h1>Preferences</h1>
  <div class="form">`;
var prefsFoot = `<div class="form-actions">
    <button class="form-control btn-positive" onclick=config.updatePreferences()>
      Save preferences
    </button><span id="save-prefs-message"></span>
  </div>
  </div> `; // add a save button sometime maybe?

function prefsTheme(options) {
  let themeHTML = `
  <div class="form-group">
    <label>Select a theme:</label>
    <select class="form-control" type="text" id="theme-selection"\
      value="${config.config.theme}">
      ${options}
    </select>
  </div>`;
  return themeHTML;
}

exports.saveDirHTML = `<div class="form-group">
  <label>Select save location:</label>
  <input class="form-control" type="text" id="savedir" value=config.config.saveDir>
  <button class="form-control" onclick=config.selectSaveDir()>Browse...</button>
  </div>`;

new Promise.all(Promise.map(Object.keys(themes), (theme) => {
  return `<option value="${theme}">${theme}</option>`;
}))
  .then((options) => {
    return new Promise.resolve(options.join("\n"));
  })
  .then((themesHTML) => {
    exports.prefsHTML = `${prefsHead}
      ${prefsTheme(themesHTML)}
    ${prefsFoot}`;
  });
