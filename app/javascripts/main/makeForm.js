// var forms = require('forms.json'); // probably read it, idk
// var fs = require('fs');
var jsonfile = require('jsonfile');
var path = require('path');

function makeForm(formName) {
    // let form;
    var formPath = path.join(__dirname, "javascripts", "main", "forms.json");
    jsonfile.readFile(formPath, function(err, forms) {
        if(err) {
            throw err;
        }
        let form = forms[formName];
        console.log(forms);
        // Update to make it handle active button:
        let nav = `<div class="pane-group">
            <div class="pane-sm sidebar">
                <nav class="nav-group">
                    <h5 class="nav-group-title">Pages</h5>
                    <a class="nav-group-item active">
                      <!--span class="icon icon-home"></span-->
                      Main
                    </a>
                    <span class="nav-group-item">
                      <!--span class="icon icon-download"></span-->
                      Influences
                    </span>
                    <span class="nav-group-item">
                      <!--span class="icon icon-folder"></span-->
                      Status
                    </span>
                </nav>
            </div>`;

        let formHead = `<div class="pane">
            <h1>${form.h1}</h1>
            <div class="form">`;

        let formFoot = `<div class="input">
                    Notes:&ensp;<textarea class="entry" name="notes"></textarea>
                </div>
                <div class="input">
                    Tags:&ensp;<input class="entry" name="tags" value="(separated by commas)" />
                </div>
                <div class="submit">
                    <button onclick="submit()">Submit</button>&ensp;<span id="submit-message">Your entry has been saved.</span>
                </div>
            </div>
            </div>
            </div>`;

        let formHTML = [];
        for (let i = 0; i < form.fields.length; i++) {
            let field = form.fields[i];
            let fieldHTML = `<div class="input">
                ${field.label}:&ensp;<input class="entry" name="${field.name}" type="${field.type}" />
            </div>`;
            formHTML.push(fieldHTML);
        }
        let formHTMLString = formHTML.join("\n");
        let content = `${nav}
            ${formHead}
            ${formHTMLString}
            ${formFoot}`;
        document.getElementById("window-content").innerHTML = content;
    });
}
