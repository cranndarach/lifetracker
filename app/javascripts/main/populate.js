var path = require('path');
var jsonfile = require('jsonfile');

// require('electron').ipcRenderer.on('loaded' , function(event, data) {
var formPath = path.join(__dirname, "javascripts", "main", "forms.json");
jsonfile.readFile(formPath, (err, forms) => {
    if (err) {
        throw err;
    }
    console.log(forms);
    console.log(forms.length);
    let buttons = [];
    for (let i = 0; i < forms.length; i++) {
        let thisForm = forms[i]
        console.log(thisForm);
        let formLink = `<p>
        <a onclick=makeForm("${thisForm.name}")>${thisForm.h1}</a>
        </p>`;
        buttons.push(formLink);
    }
    let buttonsHTML = buttons.join("\n");
    document.getElementById("pane").innerHTML = `<h1>Hello world!</h1> ${buttons}`;
});
// });
