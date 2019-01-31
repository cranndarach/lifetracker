var exports = module.exports = {};

function prefsTheme(options) {
  let userTheme = config.config.theme;
  let $groupDiv = $("<div />", {
    class: "form-group input-field"
  });
  let $select = $("<select />", {
    class: "form-control input-field",
    id: "theme-selection",
    name: "themeSelection"
  });
  let $label = $("<label />", {
    for: "theme-selection",
    text: "Select a theme",
    class: "active"
  });
  $groupDiv.append($label)
    .append($select);
  // themes is the module loaded in renderer.js.
  _.forEach(themes, (value, theme) => {
    let $opt = $("<option />", {
      value: theme,
      text: theme
    });
    if (theme === userTheme) {
      $opt.prop("selected", "selected");
    }
    $select.append($opt);
  });
  return $groupDiv;
}

function dateFormat() {
  let $groupDiv = $("<div />", {
    class: "form-group input-field"
  });
  let $label = $("<label />", {
    for: "date-fmt",
    class: "active",
    text: "Date format"
  });
  let $input = $("<input />", {
    class: "form-control",
    id: "date-fmt",
    name: "dateFmt",
    type: "text",
    value: config.config.dateFormat,
    placeholder: "e.g., MMMM DD, YYYY"
  });
  let $example = $("<div />", {
    class: "example"
  });
  let $exampleText = $("<span />", {
    id: "date-example",
    text: moment().format($input.val())
  });
  let $moreInfo = $("<span />", {
    id: "more-info",
    text: "("
  });
  let $infoLink = $("<a />", {
    text: "more info ",
    click: () => {
      shell.openExternal("https://momentjs.com/docs/#/displaying/format/");
    }
  });
  let $externalIcon = $("<i />", {
    class: "material-icons",
    text: "launch"
  });
  $moreInfo.append($infoLink)
    .append($externalIcon)
    .append(")");
  $example.append($exampleText)
    .append($moreInfo);
  $input.change(() => {
    let fmt = $input.val();
    let date = moment().format(fmt);
    $example.text(date);
  });
  $groupDiv.append($label)
    .append($input)
    .append($example);
  return $groupDiv;
}

function twelveHourToggle() {
  let $groupDiv = $("<div />", {
    class: "form-group switch"
  });
  let $label = $("<label />", {
    for: "twelve-hour",
    text: "Use 12-hour time?"
  });
  let $switch = $("<input />", {
    class: "form-control",
    id: "twelve-hour",
    name: "twelveHour",
    type: "checkbox",
  });
  let $switchSpan = $("<span />", {
    class: "lever"
  });
  let $example = $("<div />", {
    id: "time-example",
    class: "example"
  });
  $switch.change(() => {
    exports.formatTime();
  });
  if (config.config.twelveHour) {
    $switch.prop("checked", "checked");
  }
  $label.append($switch)
    .append($switchSpan);
  $groupDiv.append($label)
    .append($example);
  return $groupDiv;
}

exports.formatTime = function() {
  let fmt;
  if ($("#twelve-hour").prop("checked")) {
    fmt = "h:mm A";
  } else {
    fmt = "HH:mm";
  }
  let time = moment().format(fmt);
  $("#time-example").text(time);
};

function makeSaveDirHTML() { 
  let $groupDiv = $("<div />", {
    class: "form-group input-field"
  });
  let $label = $("<label />", {
    class: "active",
    text: "Select data folder"
  });
  let $input = $("<input />", {
    class: "form-control",
    id: "savedir",
    type: "text",
    value: config.config.saveDir,
    placeholder: config.defaultSaveDir
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
    class: "browse-btn",
    text: "Browse..."
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
    class: "form-group input-field"
  });
  let $label = $("<label />", {
    class: "active",
    text: "Select configuration folder"
  });
  let $input = $("<input />", {
    class: "form-control",
    id: "configdir",
    type: "text",
    value: config.system.configDir,
    placeholder: config.defaultConfigDir
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
    class: "browse-btn",
    text: "Browse..."
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
    id: "preferences",
    class: "col s12 xl10"
  });
  let $saveDiv = $("<div />", {
    id: "save-prefs",
    class: "form-actions"
  });
  let $saveBtn = $("<button />", {
    class: "submit-btn",
    text: "Save preferences"
  });
  $saveBtn.click(() => {
    config.updatePreferences();
  });
  let $saveMsg = $("<span />", {
    id: "save-prefs-message"
  });
  $saveDiv.append($saveBtn)
    .append($saveMsg);
  $content.append(prefsTheme())
    .append(dateFormat())
    .append(twelveHourToggle())
    .append(makeSaveDirHTML())
    .append(makeConfigDirHTML())
    .append($saveDiv);
  return $content;
};
