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

function setupDatalist(field) {
  // let catsHTML = dataProc.makeCategoryOptions().join("\n");
  let catsHTML = dataProc.categoryTags;
  let fieldHTML = `<div class="form-group">
    <label for="category">${field.label}:</label>
    <input class="form-control" list="categories" name="category" />
    <datalist id="categories">
      ${catsHTML}
    </datalist>
  </div>`;
  return fieldHTML;
}

exports.makeFormHTML = function(page, formName) {
  let form = _.omit(forms[page][formName], "formTitle");
  return new Promise((resolve, reject) => {
    form.head = `<div class="pane">
    <h1>${forms[page][formName].formTitle}</h1>
    <div class="form">`;

    form.foot = `<div class="form-group">
      <label for="notes">Notes:</label>
      <textarea class="form-control" name="notes"></textarea>
      </div>
      <div class="input">
      <label for="tags">Tags:</label>
      <input class="form-control" name="tags" value="" />
      </div>
      <div class="form-group">
      <p>
        <button id="submit" class="btn btn-form btn-default"
        onclick="submit.submit()">Submit</button>&ensp;
        <span id="submit-message">
        </span>
      </p>
      </div>
    </div>`;

    resolve(form);
  })
  .then((form) => {
    // let fieldHTML = "";
    return Promise.map(Object.keys(form.fields), (fieldName) => {
      let field = form.fields[fieldName];
      if (fieldName === "category") {
        return setupDatalist(field);
      }
      let fieldHTML = `<div class="form-group">
        <label for="${fieldName}">${field.label}:</label>
        <input class="form-control" name="${fieldName}" type=${field.type} value="${field.value}"/>
      </div>`;
      return fieldHTML;
    })
    .then((fields) => {
      return new Promise((resolve, reject) => {
        form.fieldsHTML = fields.join("\n");
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
        let content = `${form.head}
        ${form.fieldsHTML}
        ${form.foot}`;
        document.getElementById("pane").innerHTML = content;
        resolve(document.getElementsByTagName("input"));
      });
    })
    .then((inputs) => {
      var date = new Date();
      return Promise.each(inputs, (input) => {
        if (input.type === "datetime-local") {
        input.value = setDate();
        }
      });
    })
    .catch((err) => {
      console.log(err.stack);
    });
};
