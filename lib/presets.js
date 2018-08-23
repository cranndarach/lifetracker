var exports = module.exports = {};

exports.presets = CSON.requireFile(path.join(__dirname, "..", "presets.cson"));
console.log(exports.presets);

exports.groups = _.keys(exports.presets);

exports.savePresetModal = function(inputData) {
  let $modal = $("<div />", {
    "id": "save-preset-modal",
    "class": "modal"
  });
  let $content = $("<div />", {
    "id": "save-preset-content",
    "class": "modal-content"
  })
    .append($("<h2 />", {
      "text": "Save as a quick entry?"
    }))
    .append(makePresetSaveForm());
  let $footer = $("<div />", {
    "class": "modal-footer"
  })
    .append($("<button />", {
      "class": "modal-btn modal-cancel modal-close",
      "text": "Cancel"
    }))
    .append($("<button />", {
      "id": "submit-preset",
      "class": "modal-btn modal-submit modal-close",
      "text": "Save preset"
    }));

  $("#submit-preset").click(() => {
    let serialized = $("#save-preset-form input").serializeArray();
    let data = _.transform(serialized, (acc, o) => {
      acc[o.name] = o.value;
    }, {});
    if (exports.presets[data.group][data.preset-name]) {
      showConfirmOverwrite(data);
    } else {
      savePreset(data);
    }
  });

  $modal.append($content)
    .append($footer);
  return $modal;
};

function makePresetSaveForm() {
  let $checkbox = $("<p />")
    .append($("<label />", {
      "text": "Save entered times?"
    }).prepend($("<input />", {
      "id": "save-time",
      "type": "checkbox",
      "class": "form-control filled-in"
    })));
  let $form = $("<form />", {
    "id": "save-preset-form"
  }).append(makeInput("Entry name", {
    "id": "preset-name",
    "name": "preset-name"
  }))
    .append(makeInput("Group", {
      "id": "preset-group",
      "name": "preset-group",
      "class": "form-control autocomplete"
    }))
    .append($checkbox);
  return $form;
}

function makeInput(labelText, specifics) {
  let defaults = {
    "class": "form-control",
    "type": "text",
    "name": specifics.id,
    "id": specifics.name
  };
  let specs = _.defaults(specifics, defaults);
  let $div = $("<div />", {
    "class": "form-group input-field"
  })
    .append($("<label />", {
      "for": specs.id,
      "text": labelText
    }))
    .append($("<input />", specs));
  return $div;
}
