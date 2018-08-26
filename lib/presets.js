var exports = module.exports = {};

exports.presets = CSON.requireFile(path.join(__dirname, "..", "presets.cson"));
console.log(exports.presets);

exports.groups = _.keys(exports.presets);

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
    // The checkbox will always say its value is "on"; see if it's checked.
    data.saveTimes = $("#save-times").prop("checked");
    // For the moment, always say there's a conflict.
    presets.showConfirmOverwrite(data);
    // TODO: Change this back.
    // if (exports.presets[data.group][data.presetName]) {
    //   showConfirmOverwrite(data);
    // } else {
    //   savePreset(data);
    // }
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
  let name = data.presetName;
  let message = `There is already a quick entry called "${name}" in the ${group} group. Do you want to overwrite it?`;
  let $message = $("<p />", {
    text: message
  });
  $("#confirm-overwrite-content").append($message);
  $("#confirm-overwrite").modal("open");
};

function makePresetSaveForm() {
  let $checkbox = $("<label />", {
    for: "save-time"
  })
    .append($("<input />", {
      id: "save-time",
      name: "saveTime",
      type: "checkbox",
      class: "filled-in"
    }))
    .append($("<span>Save entered times?</span>"));
  let $saveTimes = $("<div />", {
    class: "form-group"
  }).append($checkbox);
  let $form = $("<form />", {
    id: "save-preset-form"
  }).append(makeInput("Entry name", {
    id: "preset-name",
    name: "presetName"
  }))
    .append(makeInput("Group", {
      id: "preset-group",
      name: "group",
      class: "form-control autocomplete"
    }))
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
