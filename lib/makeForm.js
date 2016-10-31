var jsonfile = require('jsonfile');
var path = require('path');

var exports = module.exports = {};

exports.makeForm = function(formName) {
    // let form;
    let formPath = path.join(__dirname, "javascripts", "main", "forms.json");
    jsonfile.readFile(formPath, (err, forms) => {
        if(err) {
            throw err;
        }
        let form;
        for (let i = 0; i < forms.length; i++) {
            if (forms[i].name === formName) {
                form = forms[i];

                let formHead = `<div class="pane">
                    <h1>${form.h1}</h1>
                    <div class="form">`;

                let formFoot = `<div class="form-group">
                            <label>Notes:</label><textarea class="form-control" name="notes"></textarea>
                        </div>
                        <div class="input">
                            <label>Tags:</label><input class="form-control" name="tags" value="" />
                        </div>
                        <div class="form-group">
                            <p><button class="btn btn-form btn-default" onclick="submit()">Submit</button>&ensp;<span id="submit-message">Your entry has been saved.</span></p>
                        </div>
                    </div>`;
                    // </div>
                    // </div>`;

                let formHTML = [];
                for (let i = 0; i < form.fields.length; i++) {
                    let field = form.fields[i];
                    let fieldHTML = `<div class="form-group">
                        <label>${field.label}:</label><input class="form-control" name="${field.name}" type=${field.type} value="${field.value}"/>
                    </div>`;
                    formHTML.push(fieldHTML);
                }
                let formHTMLString = formHTML.join("\n");
                // let content = `${nav}
                //     ${formHead}
                //     ${formHTMLString}
                //     ${formFoot}`;
                let content = `${formHead}
                    ${formHTMLString}
                    ${formFoot}`;
                document.getElementById("pane").innerHTML = content;
                return;
            }
        }
    });
}
