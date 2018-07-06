var exports = module.exports = {};

exports.populate = function(page) {
  let pageTitle;
  return new Promise((resolve, reject) => {
    switch (page) {
      case "home":
        console.log("Displaying home page.");
        pageTitle = "<h1>LifeTracker</h1>";
        let pageContent = "<p>Please select a page from the sidebar.</p>";
        let configWarning = "";
        // if (!config.userConfig) {
        if (Object.keys(config.userConfig).length === 0) {
          configWarning = "\n" + config.configWarning;
        }
        resolve(`${pageTitle}\n${pageContent}${configWarning}`);
        break;
      case "data":
        let $content = $("<div />", {"id": "content"})
          .append($("<h1>Data</h1>"));
        dataProc.getFields().then(() => {
          $content.append(dataProc.dataElem());
          resolve($content);
        });
        break;
      case "preferences":
        pageTitle = "<h1>Edit preferences</h1>";
        resolve(`${pageTitle}\n${prefs.prefsHTML}`);
        break;
      default:
        pageTitle = `<h1>${forms[page].pageTitle}</h1>`;
        let pageForms = _.omit(forms[page], "pageTitle");
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
        resolve(`${pageTitle}\n${btnTable}`);
    }
  }).then((content) => {
    // document.getElementById("pane").innerHTML = content;
    $("#main").html("")
      .append(content);
    // styleSidebar(page);
    M.AutoInit();
    let elem = $(".collapsible.expandable");
    let instance = M.Collapsible.init(elem, {
      accordion: false
    });
  })
    .catch((err) => {
      console.log(err.stack);
    });
};

function navBtn(where, label) {
  let btnLabel = label ? label : where.replace(/^\W/, c => c.toUpperCase());
  let $li = $("<li />");
  let $btn = $("<a />", {
    "id": where+"-menu",
    "class": "waves-effect",
    // "click": populate.populate(where),
    "text": btnLabel
  });
  $btn.click(() => {
    populate.populate(where);
  });
  $li.append($btn);
  return $li;
}

function navBtnExpandable(page) {
  let $sec = $("<li />");
  // Originally div. Not sure which is better; check here if things are weird.
  let $head = $("<a />", {
    "class": "collapsible-header waves-effect",
    "text": forms[page].pageTitle
  });
  let $bodyWrapper = $("<div />", {"class": "collapsible-body"});
  let $body = $("<ul />");
  $body.append(navBtn(page, "View all"));
  let pageData = _.omit(forms[page], "pageTitle");
  let entries = _.keys(pageData);
  entries.forEach((entry) => {
    let $li = $("<li />");
    let $btn = $("<a />", {
      "text": pageData[entry].formTitle,
      "class": "waves-effect"
    });
    $btn.click(() => {
      gen.makeForm(page, entry);
    });
    $li.append($btn);
    $body.append($li);
  });
  $bodyWrapper.append($body);
  $sec.append($head)
    .append($bodyWrapper);
  return $sec;
}

exports.fillSidebar = function() {
  let pages = _.keys(forms);
  let $sidenav = $("<ul />", {
    "id": "sidenav",
    "class": "sidenav sidenav-fixed"
  });
  let $homeBtn = navBtn("home", "Home");
  $sidenav.append($homeBtn);
  let $expandableSection = $("<ul />", {"class": "collapsible expandable"});
  pages.forEach((page) => {
    $expandableSection.append(navBtnExpandable(page));
  });
  $sidenav.append($expandableSection);
  let $divider = $("<li><div class='divider'></div></li>");
  let $dataBtn = navBtn("data");
  let $prefsBtn = navBtn("preferences", "Edit preferences");
  $sidenav.append($divider)
    .append($dataBtn)
    .append($prefsBtn);
  $("#sidebar").append($sidenav);
  // let homeBtn = `<div class="nav-group-item" id="home"><a onclick=populate.populate("home")>Home</a></div>`;
  // let endBtns = `<div class="nav-group-item" id="data"><a onclick=populate.populate("data")>Data</a></div>
  //   <div class="nav-group-item" id="preferences"><a onclick=populate.populate("preferences")>Edit preferences</a></div>`;
  // let pageBtns = pages.map((page) => {
  //   let pageBtn = `<a onclick=populate.populate("${page}")>${forms[page].pageTitle}</a>`;
  //   let entryBtns = makeEntryNavBtns(page);
  //   let navBtnSet = `<div class="nav-group-item" id="${page}">${pageBtn}\n${entryBtns}</div>`;
  //   return navBtnSet;
  // }).join("\n");
  // document.getElementById("sidebar").innerHTML += `${homeBtn}\n${pageBtns}\n${endBtns}`;
};

// function makeEntryNavBtns(pageName) {
//   let page = _.omit(forms[pageName], "pageTitle");
//   // delete page.pageTitle;
//   // console.log(forms[pageName]);
//   let entries = Object.keys(page);
//   // console.log(entries);
//   let entryBtns = entries.map((entry) => {
//     // let btn = `<div class="nav-group-subitem" id="nav-${entry}">
//     let btn = `<a class="nav-group-subitem" id="nav-${entry}" onclick='gen.makeForm("${pageName}", "${entry}")'>
//       ${page[entry].formTitle}</a>`;
//     // </div>`;
//     return btn;
//   }).join("\n");
//   return entryBtns;
// }

// function styleSidebar(page) {
//   let navBtns = document.getElementsByClassName("nav-group-item");
//   // navBtns.forEach((btn) => {
//   for (var btn of navBtns) {
//     btn.className = `nav-group-item${(btn.id === page) ? " active" : ""}`;
//     // btn.style = (btn.id === page) ? "font-weight: bold;" : "font-weight: normal;";
//     btn.style = `font-weight: ${(btn.id === page) ? "bold" : "normal"};`;
//   }
// }
