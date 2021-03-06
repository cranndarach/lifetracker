var exports = module.exports = {};

// exports.groups = _.keys(config.presets);
// exports.groups = _.map(config.presets, (value, key) => {
//   return value.pageTitle;
// });
// exports.groupsObj = _.fromPairs(_.map(exports.groups, (group) => {
//   return [group, ""];
// }));

exports.savePresetModal = function() {
  let $modal = $("<div />", {
    id: "save-preset-modal",
    class: "modal"
  });
  let $content = $("<div />", {
    id: "save-preset-content",
    class: "modal-content"
  })
    .append($("<h2 />", {
      text: "Save as a quick entry?"
    }))
    .append(makePresetSaveForm());
  let $cancelBtn = $("<button />", {
    class: "btn-flat modal-cancel modal-close",
    text: "Cancel"
  });
  let $submitBtn = $("<button />", {
    id: "submit-preset",
    class: "btn-flat",
    text: "Save preset"
  });
  $submitBtn.click(() => {
    console.log("click");
    $("#save-preset-modal").modal("close");
    let serialized = $("#save-preset-form input").serializeArray();
    let data = _.transform(serialized, (acc, o) => {
      acc[o.name] = o.value;
    }, {});
    data.group = _.camelCase(data.groupName);
    data.presetId = _.camelCase(data.presetName);
    // The checkbox will always say its value is "on"; see if it's checked.
    data.saveTimes = $("#save-times").prop("checked");
    if (config.presets[data.group] && config.presets[data.group][data.presetId]) {
      exports.showConfirmOverwrite(data);
    } else {
      savePreset(data);
    }
  });
  let $footer = $("<div />", {
    class: "modal-footer"
  }).append($cancelBtn)
    .append($submitBtn);
  $modal.append($content)
    .append($footer);
  return $modal;
};

exports.makeConfirmOverwrite = function() {
  let $overwriteBtn = $("<button />", {
    class: "btn-flat modal-cancel modal-close",
    id: "overwrite-btn",
    text: "Overwrite"
  });
  let $backBtn = $("<buton />", {
    class: "btn-flat modal-close",
    id: "back-btn",
    text: "Back"
  });
  $backBtn.click(() => {
    $("#save-preset-modal").modal("open");
  });

  let $content = $("<div />", {
    id: "confirm-overwrite-content",
    class: "modal-content"
  });
  let $foot = $("<div />", {
    class: "modal-footer"
  });
  $foot.append($overwriteBtn).append($backBtn);
  let $modal = $("<div />", {
    class: "modal",
    id: "confirm-overwrite"
  }).append($content)
    .append($foot);

  return $modal;
};

exports.showConfirmOverwrite = function(data) {
  let group = data.group;
  let presetId = data.presetId;
  let message = `There is already a quick entry called "${presetId}" in the ${group} group. Do you want to overwrite it?`;
  let $message = $("<p />", {
    text: message
  });
  $("#confirm-overwrite-content").append($message);
  $("#overwrite-btn").click(() => {
    savePreset(data);
  });
  $("#confirm-overwrite").modal("open");
};

function makePresetSaveForm() {
  let $presetName = makeInput("Entry title", {
    id: "preset-name",
    name: "presetName"
  });
  let $presetGroup = makeInput("Group", {
    id: "preset-group",
    name: "groupName",
    class: "form-control autocomplete"
  });
  let $checkboxContainer = $("<label />", {
    for: "save-times"
  });
  let $checkbox = $("<input />", {
    id: "save-times",
    name: "saveTimes",
    type: "checkbox",
    class: "filled-in"
  });
  let $checkboxText = $("<span>Save entered times?</span>");
  $checkboxContainer.append($checkbox)
    .append($checkboxText);
  let $saveTimes = $("<div />", {
    class: "form-group"
  }).append($checkboxContainer);
  let $form = $("<form />", {
    id: "save-preset-form"
  }).append($presetName)
    // .append($presetId)
    .append($presetGroup)
    .append($saveTimes);
  return $form;
}

function makeInput(labelText, specifics) {
  let defaults = {
    class: "form-control",
    type: "text",
    name: specifics.id,
    id: specifics.name
  };
  let specs = _.defaults(specifics, defaults);
  let $div = $("<div />", {
    class: "form-group input-field"
  })
    .append($("<label />", {
      for: specs.id,
      text: labelText
    }))
    .append($("<input />", specs));
  return $div;
}

function savePreset(info) {
  console.log(info);
  let presetData = {};
  let $fields = $("#form-body").find(".form-group");
  // presetData.formTitle = info.presetTitle;
  $fields.each(function() {
    let fieldInfo = {};
    let $input = $(this).find(".form-control");
    let $label = $(this).find("label");
    if (!$input.attr("id")) {
      // This should just be the button row, which doesn't need to be saved.
      return;
    }
    fieldInfo.label = $label.text();
    fieldInfo.type = $input.attr("type");
    fieldInfo.value = $input.val();
    if ($input.attr("placeholder")) {
      fieldInfo.placeholder = $input.attr("placeholder");
    }
    if (_.includes(["range", "number"], fieldInfo.type)) {
      fieldInfo.min = $input.attr("min");
      fieldInfo.max = $input.attr("max");
    } else if ($input.hasClass("timepicker")) {
      fieldInfo.class = "timepicker";
      if (!info.saveTimes) {
        fieldInfo.value = "";
      }
    } else if ($input.hasClass("datepicker")) {
      fieldInfo.class = "datepicker";
      fieldInfo.value = "";
    } else if ($input.tagName === "TEXTAREA") {
      fieldInfo.type = "textarea";
    }
    presetData[$input.attr("id")] = fieldInfo;
  });
  if (!config.presets[info.group]) {
    config.presets[info.group] = {
      pageTitle: info.groupName
    };
  }
  config.presets[info.group][info.presetId] = {
    formTitle: info.presetName,
    fields: presetData
  };
  // console.log(config.presets);
  return writePresets(config.presets).then(() => {
    populate.updateSidebarPresets();
    showMessage();
  });
}

function showMessage() {
  let time = moment().format("LT");
  let $dismissBtn = $("<button />", {
    id: "dismiss-btn",
    class: "btn-flat toast-action btn-neutral",
    text: "Dismiss"
  });
  $dismissBtn.prepend('<i class="material-icons tiny">done</i>');
  let toast = M.toast({
    html: `<span class=toast-message>Saved quick entry at ${time}!</span>`,
    displayLength: 30000
  });
  $dismissBtn.click(() => {
    toast.dismiss();
  });
  toast.$el.append($dismissBtn);
}

function writePresets(obj) {
  // console.log("writing presets");
  // console.log(obj);
  // stringify doesn't have structure to be promisified.
  return CSON.createCSONStringAsync(obj)
    .then((presetsString) => {
      // console.log(presetsString);
      return fs.writeFileAsync(path.join(config.system.configDir, "presets.cson"), presetsString);
    });
}
