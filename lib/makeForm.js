var exports = module.exports = {};

function appendZero(val) {
  if (val.length === 1) {
    val = "0" + val;
  }
  return val;
}

function setDate() {
  let date = new Date();
  // let today = date.toISOString().split("T")[0];
  let hour = appendZero(date.getHours().toString());
  let minutes = appendZero(date.getMinutes().toString());
  // Who decided this was how you should count months?
  let month = appendZero((date.getMonth() + 1).toString());
  let day = appendZero(date.getDate().toString());
  let year = date.getFullYear().toString();
  let dateString = `${year}-${month}-${day}T${hour}:${minutes}`;
  // input.value = dateString;
  // console.log(dateString);
  return dateString;
}

// function setupDatalist(field) {
//   // let catsHTML = dataProc.makeCategoryOptions().join("\n");
//   let catsHTML = dataProc.categoryTags;
//   let fieldHTML = `<div class="form-group">
//     <label for="category">${field.label}:</label>
//     <input class="form-control" list="categories" name="category" />
//     <datalist id="categories">
//       ${catsHTML}
//     </datalist>
//   </div>`;
//   return fieldHTML;
// }

exports.makeFormHTML = function(page, formName) {
  let form = _.omit(forms[page][formName], "formTitle");
  return new Promise((resolve, reject) => {
    form.head = $("<h1 />", {"html": forms[page][formName].formTitle});
    // form.head = `<div class="pane">
    // <h1>${forms[page][formName].formTitle}</h1>
    // <div class="form">`;
    form.notes = $("<div />", {"class": "form-group input-field"});
    form.notes.append($("<label />", {
      "for": "notes",
      "text": "Notes:"
    }))
      .append($("<textarea />", {
        "class": "form-control grey-text text-lighten-4",
        "name": "notes"
      }));
    form.tags = $("<div />", {"class": "form-group input-field"});
    form.tags.append($("<label />", {
      "for": "tags",
      "text": "Tags:"
    }))
      .append($("<input />", {
        "class": "form-control grey-text text-lighten-4",
        "name": "tags",
        "value": ""
      }));
    form.submitDiv = $("<div />", {"class": "form-group"});
    form.submitDiv.append($("<p />"))
      .append($("<button />", {
        "id": "submit",
        "class": "btn btn-form btn-default waves-effect waves-light",
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
    return Promise.each(Object.keys(form.fields), (fieldName) => {
      let field = form.fields[fieldName];
      console.log(field);
      let fieldDiv = $("<div />", {"class": "form-group"});
      let fieldInput = $("<input />", field);
      fieldInput.addClass("form-control grey-text lighten-4");
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
            $("input[type='datetime-local']").val(setDate());
            resolve();
          });
      });
    })
    .catch((err) => {
      console.log(err.stack);
    });
};
