var exports = module.exports = {};

exports.edit = function(entry) {
  if (typeof entry === "string") {
    entry = dataProc.data[entry];
  }
  let $header = $("<h1 />", {
    text: "Edit entry"
  });
  let $editWrapper = $("<div />", {
    id: "edit-wrapper",
    class: "form"
  });
  let $editForm = $("<div />", {
    // class: "form",
    id: "edit"
  });
  let $btnWrapper = $("<div />", {
    class: "form-actions",
    id: "edit-btns-wrapper"
  });
  let $submitBtn = $("<button />", {
    class: "submit-btn",
    id: "submit",
    text: "Update",
    click: () => {
      updateEntry();
    }
  });
  let $addRowBtn = $("<button />", {
    class: "btn-no-accent left",
    id: "add-row",
    text: "Add row",
    click: () => {
      $editForm.append(addField());
    }
  });
  let $saveMsg = $("<div />", {
    id: "message",
    class: "right-align"
  });
  $btnWrapper.append($addRowBtn)
    .append($submitBtn);
  $editForm.data(entry);
  _.forEach(_.toPairs(entry), (pair) => {
    if (pair[0] === "uuid") {
      return;
    }
    let $field = addField(pair[0], pair[1]);
    if (pair[0] === "category") {
      $field.find(".edit-val").addClass("autocomplete");
    }
    $editForm.append($field);
  });
  $editWrapper.append($editForm)
    .append($btnWrapper)
    .append($saveMsg);
  $("#content").html($header)
    .append($editWrapper)
    .ready(materialize);
};

function addField(key, val) {
  let $keyInput = $("<input />", {
    type: "text",
    class: "input-field form-control edit edit-key",
    value: key,
    placeholder: key
  });
  let $valInput = $("<input />", {
    type: "text",
    class: "input-field form-control edit edit-val",
    value: val,
    placeholder: val
  });
  let $sep = $("<span />", {
    class: "edit-separator",
    html: ":&nbsp;"
  });
  let $field = $("<div />", {
    class: "edit-group"
  });
  $field.append($keyInput)
    .append($sep)
    .append($valInput);
  return $field;
}

function updateEntry() {
  let orig = $("#edit").data();
  let entry = {
    uuid: orig.uuid
  };
  return Promise.all(Promise.each($(".edit-group"), function (group) {
    let key = $(group).find(".edit-key").val();
    let val = $(group).find(".edit-val").val();
    // Only save if it at least has a key.
    if (key) {
      entry[key] = val;
    }
  }))
    .then(() => {
      console.log(entry);
      dataProc.data[entry.uuid] = entry;
      if (entry.category) {
        dataProc.updateCategories(entry.category);
      }
      let savePath = path.join(config.config.saveDir, `data-${entry.uuid}.json`);
      return jsonfile.writeFileAsync(savePath, entry);
    })
    .then(() => {
      dataProc.makeKeys();
      $("#message").text("Updated entry!");
      let $tgt = $("#edit");
      let selector = ".form-control";
      $tgt.on("change", selector, (e) => {
        populate.clearMessage($tgt, selector, e);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

function materialize() {
  $(".autocomplete").autocomplete({
    data: dataProc.categoryObj
  });
  $(".autocomplete").on("keydown", function(e) {
    if ((e.which === 9) && (!e.shiftKey)) {
      e.preventDefault();
      exports.tabComplete(e);
    }
  });
}
