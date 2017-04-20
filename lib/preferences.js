var exports = module.exports = {};
var prefsHead = `<h1>Preferences</h1>
  <div class="form">`;
var prefsFoot = `</div>`; // add a save button sometime maybe?
function prefsTheme(options) {
  let themeHTML = `
  <div class="form-group">
    <label>Select a theme:</label>
    <select class="form-control" type="text" id="theme-selection"\
      value="${config.config.theme}" onchange=config.updateTheme()>
      ${options}
    </select>
  </div>`;
  return themeHTML;
}

// var themesHTML = "";
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
