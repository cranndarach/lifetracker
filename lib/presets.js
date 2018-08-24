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
  let $footer = $("<div />", {
    class: "modal-footer"
  })
    .append($("<button />", {
      class: "btn-flat modal-cancel modal-close",
      text: "Cancel"
    })
    )
    .append($("<button />", {
      id: "submit-preset",
      class: "btn-flat modal-close",
      text: "Save preset"
    }));

  $("#submit-preset").click(() => {
    let serialized = $("#save-preset-form input").serializeArray();
    let data = _.transform(serialized, (acc, o) => {
      acc[o.name] = o.value;
    }, {});
    if (exports.presets[data.group][data.presetName]) {
      showConfirmOverwrite(data);
    } else {
      savePreset(data);
    }
  });

  $modal.append($content)
    .append($footer);
  return $modal;
};

function showConfirmOverwrite(data) {
  let group = data.group;
  let name = data.preset-name;
  let message = `There is already a quick entry called "${name}" in the ${group} group. Do you want to overwrite it?`;
  let $message = $("<p />", {
    text: message
  });
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
    exports.makePresetModal();
  });
  
  let $content = $("<div />", {
    class: "modal-content"
  });
  let $foot = $("<div />", {
    class: "modal-footer"
  });
  $content.append($message);
  $foot.append($overwriteBtn).append($backBtn);
  let $modal = $("<div />", {
    class: "modal",
    id: "confirm-overwrite"
  }).append($content)
    .append($foot);

  return $modal;
}

function makePresetSaveForm() {
  let $checkbox = $("<label />", {
    for: "save-time"
  })
    .append($("<input />", {
      id: "save-time",
      name: "save-time",
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
      name: "preset-group",
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
