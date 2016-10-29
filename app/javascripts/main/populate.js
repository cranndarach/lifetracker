var path = require('path');
var jsonfile = require('jsonfile');

function populate(page) {
    let formPath = path.join(__dirname, "javascripts", "main", "forms.json");
    jsonfile.readFile(formPath, (err, forms) => {
        if (err) {
            throw err;
        }
        let buttonsMain, buttonsInfluence, buttonsStatus;
        buttonsMain = [];
        buttonsInfluence = [];
        buttonsStatus = [];
        for (let i = 0; i < forms.length; i++) {
            let thisForm = forms[i];
            // console.log(thisForm.page);
            let formLink = `<td>
            <button class="btn btn-large btn-primary" onclick=makeForm("${thisForm.name}")>${thisForm.h1}</button>
            </td>`;
            switch (thisForm.page) {
                case "main":
                    buttonsMain.push(formLink);
                    break;
                case "influences":
                    buttonsInfluence.push(formLink);
                    break;
                case "status":
                    buttonsStatus.push(formLink);
                    break;
                default:
                    console.log(`Cannot find page "${thisForm.page}." Ignoring form "${thisForm.h1}."`);
            }
        }
        let buttonsHTML;
        switch (page) {
            case "main":
                // console.log(buttonsMain);
                buttonsHTML = buttonsMain //.join("");
                break;
            case "influences":
                // console.log(buttonsInfluence);
                buttonsHTML = buttonsInfluence //.join("");
                break;
            case "status":
                // console.log(buttonsStatus);
                buttonsHTML = buttonsStatus //.join("");
                break;
            default:
                console.log(`Displaying home page.`);
                buttonsHTML = [`<p>Please select a page from the sidebar.</p>`];
        }
        if (buttonsHTML.length != 1) {
            for (let i = 0; i < buttonsHTML.length; i++) {
                let col = i % 3;
                // let btn = buttonsHTML[i];
                if (col == 0) {
                    buttonsHTML[i] = `<tr>${buttonsHTML[i]}`;
                } else if (col == 2) {
                    buttonsHTML[i] = `${buttonsHTML[i]}</tr>`;
                }
            }
        }
        buttonsHTML = buttonsHTML.join("");
        document.getElementById("pane").innerHTML = `<h1>Hello world!</h1> <table>${buttonsHTML}</table>`;
        let navBtns = document.getElementsByClassName("nav-group-item");
        for (let i = 0; i < navBtns.length; i++) {
            let thisBtn = navBtns[i];
            let thisID = thisBtn.id;
            let pageStyle = "font-weight: normal;";
            let pageClass = "nav-group-item";
            if (thisID == page) {
                pageStyle = "font-weight: bold;";
                pageClass += " active";
            }
            document.getElementById(thisID).style = pageStyle;
            document.getElementById(thisID).className = pageClass;
        }
        // document.getElementById(page).style = "font-weight: bold";
        // document.getElementById(page).className += " active";

    });
}
