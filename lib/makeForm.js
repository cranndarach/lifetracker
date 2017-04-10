var exports = module.exports = {};

exports.makeForm = function(formName) {
  let formPath = __dirname + '/forms.json';
  // jsonfile.readFile(formPath, (err, forms) => {
  readjson(formPath)
    .then((forms) => {
      return new Promise((resolve, reject) => {
        forms.forEach((form) => {
          if (form.name == formName) {
            resolve(form);
          }
        });
      });
    })
    .then((form) => {
      return new Promise((resolve, reject) => {
        form.head = `<div class="pane">
          <h1>${form.h1}</h1>
          <div class="form">`;

        form.foot = `<div class="form-group">
              <label>Notes:</label>
              <textarea class="form-control" name="notes"></textarea>
            </div>
            <div class="input">
              <label>Tags:</label>
              <input class="form-control" name="tags" value="" />
            </div>
            <div class="form-group">
              <p>
                <button class="btn btn-form btn-default"
                  onclick="submit.submit()">Submit</button>&ensp;
                <span id="submit-message" class="hide">
                  Your entry has been saved.
                </span>
              </p>
            </div>
          </div>`;

          resolve(form);
        });
    })
    .then((form) => {
      // let fieldHTML = "";
      return Promise.map(form.fields, (field) => {
        let fieldHTML = `<div class="form-group">
          <label>${field.label}:</label><input class="form-control" name="${field.name}" type=${field.type} value="${field.value}"/>
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
      return Promise.each(inputs, (input) => {
        if (input.type === "datetime-local") {
          let now = new Date().toISOString();
          input.value = now;
          console.log(`Set date for ${input.name} to ${now}.`);
        }
      });
    })
    //   let content = `${formHead}
    //     ${formHTMLString}
    //     ${formFoot}`;
    //   document.getElementById("pane").innerHTML = content;
    //   let inputs = document.getElementsByTagName("input");
    //   input.forEach((field) => {
    //     if (field.type === "datetime-local") {
    //       field.value = new Date().toLocaleString();
    //     }
    //   });
    //   return;
    // // });
    // })
    .catch((err) => {
      console.log(err.stack);
    });
};
