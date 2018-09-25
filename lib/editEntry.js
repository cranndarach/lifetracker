var exports = module.exports = {};

exports.makeEditPage = function(entry) {
  let $header = $("<h1 />", {
    text: "Edit entry"
  });
  let $editForm = $("<div />", {
    class: "form",
    id: "edit"
  });
  let $submitWrapper = $("<div />", {
    class: "form-actions"
  });
  let $submitBtn = $("<button />", {
    class: "submit-btn",
    id: "submit",
    text: "Update",
    click: () => {
      updateEntry();
    }
  });
  $submitWrapper.append($submitBtn);
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
  $editForm.append($submitWrapper);
  $("#content").html($header)
    .append($editForm)
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
  let entry = $("#edit-form").data();
  return Promise.all(Promise.each($(".edit-group"), function (group) {
    // TODO
    return;
  }));
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
