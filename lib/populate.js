var exports = module.exports = {};

exports.populate = function(page) {
  return new Promise((resolve, reject) => {
    switch (page) {
      case "home":
    // if (page === "home") {
        console.log("Displaying home page.");
        // There isn't a super reasonable way rn to have a title for each page.
        // But will probably add a field to forms.cson for the displayed title
        // of each page. Leaving this here as a sort of placeholder.
        let pageTitle = "<h1>LifeTracker</h1>";
        let pageContent = "<p>Please select a page from the sidebar.</p>";
        resolve(`${pageTitle}\n${pageContent}`);
        break;
      case "data":
        let pageTitle = "<h1>LifeTracker</h1>";
        dataProc.getFields().then(resolve(`${pageTitle}\n ${dataProc.dataHTML()}`));
        break;
      case "preferences":
        let pageTitle = "<h1>LifeTracker</h1>";
        resolve(`${pageTitle}\n${prefs.prefsHTML}`);
        break;
      default:
        // Eventually replace this with a reference to a field containing the title.
        let pageTitle = `<h1>LifeTracker</h1>`;
        let pageForms = forms[page];
        let counter = 0;
        let buttons = Object.keys(pageForms).map((key) => {
          let col = counter++ % 3;
          let formLink = `<td>
          <button class="btn btn-large btn-primary" 
            onclick=gen.makeForm("${key}")>${pageForms[key].formTitle}</button>
          </td>`;
          if (col === 0) {
            formLink = `<tr>${formLink}`;
          } else if (col === 2) {
            formLink = `${formLink}</tr>`;
          }
          return formLink;
        }).join("\n");
        let btnTable = `<table>${buttons}</table>`;
        // resolve(btnTable);
        resolve(`${pageTitle}\n${btnTable}`);
    }
  }).then((content) => {
      document.getElementById("pane").innerHTML = content;
      styleSidebar(page);
    });
};

function styleSidebar(page) {
  let navBtns = document.getElementsByClassName("nav-group-item");
  // navBtns.forEach((btn) => {
  for (var btn of navBtns) {
    btn.className = `nav-group-item${(btn.id === page) ? " active" : ""}`;
    // btn.style = (btn.id === page) ? "font-weight: bold;" : "font-weight: normal;";
    btn.style = `font-weight: ${(btn.id === page) ? "bold" : "normal"};`;
  }
}
