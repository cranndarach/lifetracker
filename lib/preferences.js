var exports = module.exports = {};

function prefsTheme(options) {
  let userTheme = config.config.theme;
  let $groupDiv = $("<div />", {
    "class": "input-field"
  });
  let $select = $("<select />", {
    "class": "form-control",
    "id": "theme-selection"
  });
  let $label = $("<label />", {
    "text": "Select a theme:"
  });
  $groupDiv.append($label)
    .append($select);
  // themes is the module loaded in renderer.js.
  _.forEach(themes, (value, theme) => {
    let $opt = $("<option />", {
      "value": theme,
      "text": theme
    });
    if (theme === userTheme) {
      $opt.prop("selected", "selected");
    }
    $select.append($opt);
  });
  return $groupDiv;
  // let themeHTML = `
  // <div class="form-group">
  //   <label>Select a theme:</label>
  //   <select class="form-control" type="text" id="theme-selection">
  //     ${options}
  //   </select>
  // </div>`;
  // return themeHTML;
}

function makeSaveDirHTML() { 
  let $groupDiv = $("<div />", {
    "class": "form-group input-field"
  });
  let $label = $("<label />", {
    "class": "active",
    "text": "Select save location:"
  });
  let $input = $("<input />", {
    "class": "form-control",
    "id": "savedir",
    "type": "text",
    "value": config.config.saveDir
  });
  let $btn = $("<button />", {
    "class": "browse-btn",
    "text": "Browse..."
  });
  $btn.click(() => {
    config.selectSaveDir();
  });
  $groupDiv.append($label)
    .append($input)
    .append($btn);
  return $groupDiv;
  // let html = `<div class="form-group">
  // <label>Select save location:</label>
  // <input class="form-control" type="text" id="savedir" value=${config.config.saveDir}>
  // <button class="btn-small btn-default" onclick=config.selectSaveDir()>Browse...</button>
  // </div>`;
  // return html;
}

// exports.makePrefs = function() {
//   let userTheme = config.config.theme;
//   return new Promise.all(Promise.map(Object.keys(themes), (theme) => {
//     let selected = theme === userTheme ? "selected" : "";
//     return `<option ${selected} value="${theme}">${theme}</option>`;
//   }))
//     .then((options) => {
//       return new Promise.resolve(options.join("\n"));
//     })
//     .then((themesHTML) => {
//       exports.prefsHTML = `${prefsHead}
//         ${makeSaveDirHTML()}
//         ${prefsTheme(themesHTML)}
//       ${prefsFoot}`;
//     });
// };
// exports.makePrefs();

exports.prefsHTML = function() {
  let $content = $("<div />", {
    "id": "preferences",
    "class": "form"
  });
  let $saveDiv = $("<div />", {
    "class": "form-actions"
  });
  let $saveBtn = $("<button />", {
    "class": "submit-btn",
    "text": "Save preferences"
  });
  $saveBtn.click(() => {
    config.updatePreferences();
  });
  let $saveMsg = $("<span />", {
    "id": "save-prefs-message"
  });
  $saveDiv.append($saveBtn)
    .append($saveMsg);
  $content.append(prefsTheme())
    .append(makeSaveDirHTML())
    .append($saveDiv);
  return $content;
};
