var exports = module.exports = {};

exports.presets = CSON.requireFile(path.join(__dirname, "..", "presets.cson"));
console.log(exports.presets);

// exports.groups = _.keys(exports.presets);
exports.groups = _.map(exports.presets, (value, key) => {
  return value.pageTitle;
});
exports.groupsObj = _.fromPairs(_.map(exports.groups, (group) => {
  return [group, ""];
}));

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
    // The checkbox will always say its value is "on"; see if it's checked.
    data.saveTimes = $("#save-times").prop("checked");
    if (exports.presets[data.group] && exports.presets[data.group][data.presetId]) {
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
  $overwriteBtn.click(() => {
    savePreset();
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
  $("#confirm-overwrite").modal("open");
};

function makePresetSaveForm() {
  let $presetTitle = makeInput("Entry title", {
    id: "preset-title",
    name: "presetTitle"
  });
  let $presetId = $("<div />", {
    class: "form-group input-field",
  });
  let $presetIdInput = $("<input />", {
    class: "form-control",
    id: "preset-identifier",
    name: "presetId",
    type: "text"
  });
  let $presetIdLabel = $("<label />", {
    for: "preset-identifier",
    text: "Entry identifier"
  });
  let $presetIdTooltip = $("<i />", {
    class: "tooltipped material-icons",
    text: "help",
    "data-position": "right",
    "data-tooltip": "This is how the program will identify the quick entry. It should start with a lowercase letter and contain only letters and numbers, and it should be unique within a group."
  });
  $presetIdLabel.append("&nbsp;")
    .append($presetIdTooltip);
  $presetId.append($presetIdLabel)
    .append($presetIdInput);
  let $presetGroup = makeInput("Group", {
    id: "preset-group",
    name: "groupName",
    class: "form-control autocomplete"
  });
  let $checkboxContainer = $("<label />", {
    for: "save-time"
  });
  let $checkbox = $("<input />", {
    id: "save-time",
    name: "saveTime",
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
  }).append($presetTitle)
    .append($presetId)
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
  if (!exports.presets[info.group]) {
    exports.presets[info.group] = {
      pageTitle: info.groupName
    };
  }
  exports.presets[info.group][info.presetId] = {
    formTitle: info.presetTitle,
    fields: presetData
  };
  writePresets().then(() => {
    populate.updateSidebarPresets();
    $("#message").text("Saved quick entry!");
  });
}

function writePresets() {
  let presetsCSON = CSON.stringify(exports.presets);
  return fs.writeFileAsync(path.join(__dirname, "..", "presets.cson"), presetsCSON);
}
