var exports = module.exports = {};

function appendZero(val) {
  if (val.length === 1) {
    val = "0" + val;
  }
  return val;
}

// function setDate() {
//   let date = new Date();
//   // let today = date.toISOString().split("T")[0];
//   let hour = appendZero(date.getHours().toString());
//   let minutes = appendZero(date.getMinutes().toString());
//   // Who decided this was how you should count months?
//   let month = appendZero((date.getMonth() + 1).toString());
//   let day = appendZero(date.getDate().toString());
//   let year = date.getFullYear().toString();
//   let dateString = `${year}-${month}-${day}T${hour}:${minutes}`;
//   // input.value = dateString;
//   // console.log(dateString);
//   return dateString;
// }

exports.makeFormHTML = function(page, formName) {
  let form = _.omit(forms[page][formName], "formTitle");
  return new Promise((resolve, reject) => {
    form.head = $("<h1 />", {"html": forms[page][formName].formTitle});
    form.notes = $("<div />", {"class": "form-group input-field"});
    form.notes.append($("<label />", {
      "for": "notes",
      "text": "Notes"
    }))
      .append($("<textarea />", {
        "class": "form-control materialize-textarea",
        "name": "notes",
        "id": "notes"
      }));
    form.tags = $("<div />", {"class": "form-group input-field"});
    form.tags.append($("<label />", {
      "for": "tags",
      "text": "Tags"
    }))
      .append($("<input />", {
        "class": "form-control",
        "type": "text",
        "name": "tags",
        "id": "tags"
      }));
    form.submitDiv = $("<div />", {"class": "form-group"});
    form.submitDiv.append($("<p />"))
      .append($("<button />", {
        "id": "submit",
        "class": "submit-btn",
        "onclick": "submit.submit()",
        "text": "Submit"
      }))
      .append("&ensp;")
      .append($("<span />", {"id": "submit-message"}));
    resolve(form);
  })
  .then((form) => {
    form.body = $("<div />", {
      "class": "form",
      "id": "form-body"
    });
    return Promise.each(_.keys(form.fields), (fieldName) => {
      let field = form.fields[fieldName];
      let fieldConfig = _.omit(field, ["label"]);
      fieldConfig.name = fieldConfig.name ? fieldConfig.name : fieldName;
      fieldConfig.id = fieldConfig.id ? fieldConfig.id : fieldName;
      // console.log(field);
      let fieldDiv = $("<div />", {"class": "form-group"});
      let fieldInput = $("<input />", fieldConfig);
      fieldInput.addClass("form-control");
      fieldDiv.append($("<label />", {
        "for": fieldName,
        // "class": "col s12",
        "text": field.label
      }))
        .append(fieldInput);
      switch (field.type) {
        case "text":
          if (fieldName === "category") {
            fieldInput.addClass("autocomplete");
          }
          fieldDiv.addClass("input-field");
          if (fieldInput.val() || fieldInput.prop("placeholder")) {
            fieldDiv.children("label").addClass("active");
          }
          break;
        case "range":
          fieldDiv.addClass("range-field");
          break;
        default:
          break;
      }
      form.body.append(fieldDiv);
    })
    .then((fields) => {
      return new Promise((resolve, reject) => {
        form.body.append(form.notes)
          .append(form.tags)
          .append(form.submitDiv);
        resolve(form);
      });
    });
  })
  .catch((err) => {
    console.log(err.stack);
  });
};

exports.makeForm = function(page, formName) {
  exports.makeFormHTML(page, formName)
    .then((form) => {
      return new Promise((resolve, reject) => {
        let content = $("<div />", {"class": "content"});
        content.append(form.head)
          .append(form.body);
        $("#main").html("")
          .append(content)
          .ready(() => {
            $("input.autocomplete").autocomplete({
              data: dataProc.categoryObj
            });
            $("input.datepicker").datepicker({
              "showClearBtn": true
            });
            $("input.timepicker").timepicker({
              "showClearBtn": true
            });
            // $("input[type='datetime-local']").val(moment().format("YYYY-MM-DD"));
            resolve();
          });
      });
    })
    .catch((err) => {
      console.log(err.stack);
    });
};
