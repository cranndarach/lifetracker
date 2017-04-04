var exports = module.exports = {};

exports.populate = function(page) {
  // let formPath = path.join(__dirname, "javascripts", "main", "forms.json");
  let formPath = __dirname + '/forms.json';
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
      <button class="btn btn-large btn-primary" 
        onclick=gen.makeForm("${thisForm.name}")>${thisForm.h1}</button>
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
          console.log(`Cannot find page "${thisForm.page}." Ignoring\
                form "${thisForm.h1}."`);
      }
    }
    let buttonsHTML;
    let promise = new Promise((fulfill, reject) => {
      switch (page) {
        case "main":
          fulfill(buttonsMain);
          break;
        case "influences":
          fulfill(buttonsInfluence);
          break;
        case "status":
          fulfill(buttonsStatus);
          break;
        case "data":
          // dataProc.combineData(() => {
          //   fulfill([dataProc.dataHTML]);
          // });
          dataProc.getFields()
            .then(dataProc.fillFieldHTML)
            .then(dataProc.fillQueryHTML)
            .then(dataProc.fillSearchHTML)
            .then(dataProc.fillDataHTML)
            .then((dataHTML) => {
              fulfill([dataHTML]);
              // return dataHTML;
            });
          // fulfill([dataHTML]);
          break;
        case "preferences":
          fulfill([prefs.prefsHTML]);
          break;
        default:
          console.log(`Displaying home page.`);
          fulfill([`<p>Please select a page from the sidebar.</p>`]);
      }
    });
    promise.then((btns) => {
      if (btns.length != 1) {
        for (let i = 0; i < btns.length; i++) {
          let col = i % 3;
          // let btn = btns[i];
          if (col === 0) {
            btns[i] = `<tr>${btns[i]}`;
          } else if (col == 2) {
            btns[i] = `${btns[i]}</tr>`;
          }
        }
      }
      btns = btns.join("");
      document.getElementById("pane").innerHTML = `<h1>LifeTracker</h1>\
        <table>${btns}</table>`;
    });
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
  });
}
