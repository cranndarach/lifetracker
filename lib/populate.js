var exports = module.exports = {};

exports.populate = function(page) {
  let pageTitle;
  return new Promise((resolve, reject) => {
    switch (page) {
      case "home":
    // if (page === "home") {
        console.log("Displaying home page.");
        // There isn't a super reasonable way rn to have a title for each page.
        // But will probably add a field to forms.cson for the displayed title
        // of each page. Leaving this here as a sort of placeholder.
        pageTitle = "<h1>LifeTracker</h1>";
        let pageContent = "<p>Please select a page from the sidebar.</p>";
        resolve(`${pageTitle}\n${pageContent}`);
        break;
      case "data":
        pageTitle = "<h1>Data</h1>";
        dataProc.getFields().then(resolve(`${pageTitle}\n${dataProc.dataHTML()}`));
        break;
      case "preferences":
        pageTitle = "<h1>Edit preferences</h1>";
        resolve(`${pageTitle}\n${prefs.prefsHTML}`);
        break;
      default:
        // let pgTitle = forms[page].pageTitle;
        // console.log(forms[page]);
        // console.log(pgTitle);
        pageTitle = `<h1>${forms[page].pageTitle}</h1>`;
        let pageForms = _.omit(forms[page], "pageTitle");
        // delete pageForms.pageTitle;
        let counter = 0;
        let buttons = Object.keys(pageForms).map((key) => {
          let col = counter++ % 3;
          let formLink = `<td>
          <button class="btn btn-large btn-primary" \
            onclick='gen.makeForm("${page}", "${key}")'>${pageForms[key].formTitle}</button>
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

exports.fillSidebar = function() {
  let pages = Object.keys(forms);
  console.log(forms);
  console.log(pages);
  let homeBtn = `<div class="nav-group-item" id="home"><a onclick=populate.populate("home")>Home</a></div>`;
  let endBtns = `<div class="nav-group-item" id="data"><a onclick=populate.populate("data")>Data</a></div>
    <div class="nav-group-item" id="preferences"><a onclick=populate.populate("preferences")>Edit preferences</a></div>`;
  let pageBtns = pages.map((page) => {
    let pageBtn = `<a onclick=populate.populate("${page}")>${forms[page].pageTitle}</a>`;
    let entryBtns = makeEntryNavBtns(page);
    let navBtnSet = `<div class="nav-group-item" id="${page}">${pageBtn}\n${entryBtns}</div>`;
    return navBtnSet;
  }).join("\n");
  document.getElementById("sidebar").innerHTML += `${homeBtn}\n${pageBtns}\n${endBtns}`;
};

function makeEntryNavBtns(pageName) {
  let page = _.omit(forms[pageName], "pageTitle");
  // delete page.pageTitle;
  // console.log(forms[pageName]);
  let entries = Object.keys(page);
  // console.log(entries);
  let entryBtns = entries.map((entry) => {
    // let btn = `<div class="nav-group-subitem" id="nav-${entry}">
    let btn = `<a class="nav-group-subitem" id="nav-${entry}" onclick='gen.makeForm("${pageName}", "${entry}")'>
      ${page[entry].formTitle}</a>`;
    // </div>`;
    return btn;
  }).join("\n");
  return entryBtns;
}

function styleSidebar(page) {
  let navBtns = document.getElementsByClassName("nav-group-item");
  // navBtns.forEach((btn) => {
  for (var btn of navBtns) {
    btn.className = `nav-group-item${(btn.id === page) ? " active" : ""}`;
    // btn.style = (btn.id === page) ? "font-weight: bold;" : "font-weight: normal;";
    btn.style = `font-weight: ${(btn.id === page) ? "bold" : "normal"};`;
  }
}
