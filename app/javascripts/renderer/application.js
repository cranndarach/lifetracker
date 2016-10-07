var path = require('path');
var jsonfile = require('jsonfile');

require('electron').ipcRenderer.on('loaded' , function(event, data) {
    let formPath = path.join(__dirname, "javascripts", "main", "forms.json");
    jsonfile.readFile(formPath, function(err, forms) {
        if(err) {
            throw err;
        }
        let buttons = [];
        for (let i = 0; i < forms.length; i++) {
            let thisForm = forms[i]
            let formLink = `<p>
            <a>${thisForm.h1}</a>
            </p>`;
            buttons.push(formLink);
        }
        buttons = buttons.join("\n");
        document.getElementById("pane").innerHTML = '<h1>Hello world!</h1> ${buttons}';
    });
});
