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
    form.notes = $("<div />", {"class": "form-group"});
    form.notes.append($("<label />", {
      "for": "notes",
      "text": "Notes:"
    }))
      .append($("<textarea />", {
        "class": "form-control",
        "name": "notes"
      }));
    form.tags = $("<div />", {"class": "input"});
    form.tags.append($("<label />", {
      "for": "tags",
      "text": "Tags:"
    }))
      .append($("<input />", {
        "class": "form-control",
        "name": "tags",
        "value": ""
      }));
    form.submitDiv = $("<div />", {"class": "form-group"});
    form.submitDiv.append($("<p />"))
      .append($("<button />", {
        "id": "submit",
        "class": "btn btn-form btn-default",
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
      fieldInput.addClass("form-control");
      fieldDiv.append($("<label />", {
        "for": fieldName,
        "html": field.label
      }))
        .append(fieldInput);
        // .append($("<input />", {
        //   "class": "form-control",
        //   "name": fieldName,
        //   "type": field.type,
        //   "value": field.value
        // }));
      switch (field.type) {
        case "text":
          if (fieldName === "category") {
            fieldInput.addClass("autocomplete");
          }
          fieldDiv.addClass("input-field");
          if (fieldInput.val()) {
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
      // let fieldHTML = `<div class="form-group">
      // <label for="${fieldName}">${field.label}:</label>
      // <input class="form-control" name="${fieldName}" type=${field.type} value="${field.value}"/>
      // </div>`;
      // return fieldDiv;
    })
    .then((fields) => {
      return new Promise((resolve, reject) => {
        // form.fieldsHTML = fields.join("\n");
        // form.body = formBody;
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
        let content = $("<div />", {"class": "pane"});
        content.append(form.head)
          .append(form.body);
        $("#pane").html("")
          .append(content)
          .ready(() => {
            $("input.autocomplete").autocomplete({
              data: dataProc.categoryObj
            });
          });
        // let content = `${form.head}
        // ${form.fieldsHTML}
        // ${form.foot}`;
        // document.getElementById("pane").innerHTML = content;
        // resolve(document.getElementsByTagName("input"));
        resolve($("input[type='datetime-local']"));
      });
    })
    .then((inputs) => {
      // I think it still needs to be thenable. Confirm when possible.
      return new Promise((resolve, reject) => {
        var date = new Date();
        inputs.val(setDate());
      });
      // return Promise.each(inputs, (input) => {
      //   // if (input.type === "datetime-local") {
      //   input.val(setDate());
      //   // }
      // });
    })
    .catch((err) => {
      console.log(err.stack);
    });
};
