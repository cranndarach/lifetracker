var exports = module.exports = {};

exports.makeEditPage = function(entry) {
  let $header = $("<h1 />", {
    text: "Edit entry"
  });
  let $editForm = $("<div />", {
    class: "form",
    id: "edit"
  });
  _.forEach(_.toPairs(entry), (pair) => {
    $editForm.append(addField(pair[0], pair[1]));
  });
  $("#content").html($header)
    .append($editForm);
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
