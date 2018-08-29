var exports = module.exports = {};

function prefsTheme(options) {
  let userTheme = config.config.theme;
  let $groupDiv = $("<div />", {
    "class": "form-group input-field"
  });
  let $select = $("<select />", {
    "class": "form-control input-field",
    "id": "theme-selection"
  });
  let $label = $("<label />", {
    "text": "Select a theme",
    "class": "active"
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
}

function makeSaveDirHTML() { 
  let $groupDiv = $("<div />", {
    "class": "form-group input-field"
  });
  let $label = $("<label />", {
    "class": "active",
    "text": "Select data folder"
  });
  let $input = $("<input />", {
    "class": "form-control",
    "id": "savedir",
    "type": "text",
    "value": config.config.saveDir,
    "placeholder": config.defaultSaveDir
  });
  let $saveDirTooltip = $("<i />", {
    class: "tooltipped material-icons",
    text: "help",
    "data-position": "right",
    "data-tooltip": "This is where your entries will be stored."
  });
  $label.append("&nbsp;")
    .append($saveDirTooltip);
  let $btn = $("<button />", {
    "class": "browse-btn",
    "text": "Browse..."
  });
  $btn.click(() => {
    config.selectDir($input, config.config.saveDir);
  });
  $groupDiv.append($label)
    .append($input)
    .append($btn);
  return $groupDiv;
}

function makeConfigDirHTML() { 
  let $groupDiv = $("<div />", {
    "class": "form-group input-field"
  });
  let $label = $("<label />", {
    "class": "active",
    "text": "Select configuration folder"
  });
  let $input = $("<input />", {
    "class": "form-control",
    "id": "configdir",
    "type": "text",
    "value": config.system.configDir,
    "placeholder": config.defaultConfigDir
  });
  let $configDirTooltip = $("<i />", {
    class: "tooltipped material-icons",
    text: "help",
    "data-position": "right",
    "data-tooltip": "This is where files like config.cson, forms.cson, and presets.cson will be stored."
  });
  $label.append("&nbsp;")
    .append($configDirTooltip);
  let $btn = $("<button />", {
    "class": "browse-btn",
    "text": "Browse..."
  });
  $btn.click(() => {
    config.selectDir($input, config.system.configDir);
  });
  $groupDiv.append($label)
    .append($input)
    .append($btn);
  return $groupDiv;
}

exports.prefsHTML = function() {
  let $content = $("<div />", {
    "id": "preferences",
    "class": "form"
  });
  let $saveDiv = $("<div />", {
    "id": "save-prefs",
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
    .append(makeConfigDirHTML())
    .append($saveDiv);
  return $content;
};
