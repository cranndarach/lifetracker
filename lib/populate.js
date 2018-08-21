var exports = module.exports = {};

exports.populate = function(page) {
  let $pageTitle = $("<h1 />");
  let $content = $("<div />", {
    "id": "content"
    // "class": "col s12"
  });
  $content.append($pageTitle);
  switch (page) {
    case "home":
      console.log("Displaying home page.");
      $pageTitle.text("LifeTracker");
      let $pageContent = $("<p>Please select a page from the sidebar.</p>");
      $content.append($pageContent);
      break;
    case "data":
      $pageTitle.text("Data");
      // dataProc.getFields().then(() => {
      $content.append(dataProc.dataElem())
        .ready(() => {
          dataProc.displayData();
          // Materialize changes `select` elements completely; this allows
          // the resulting instances to be kept in an array. The lack of
          // JQuery is intentional!
          // let instances = M.FormSelect.init(document.querySelectorAll("select"));
          // exports.selectInstances.push(instances);
          // $("select").formSelect();
        });
      // });
      break;
    case "preferences":
      $pageTitle.text("Edit preferences");
      $content.append(prefs.prefsHTML());
      break;
    default:
      $pageTitle.text(forms[page].pageTitle);
      let $btnTable = $("<table />", {
        "class": "button-table"
      });
      let pageForms = _.omit(forms[page], "pageTitle");
      let counter = 0;
      let $row;
      _.forEach(pageForms, (value, key) => {
        let col = counter++ % 3;
        if (col === 0) {
          $row = $("<tr />");
          $btnTable.append($row);
        }
        let $cell = $("<td />");
        let $formLink = $("<button />", {
          "class": "page-btn",
          "text": value.formTitle
        });
        $formLink.click(() => {
          gen.makeForm(page, key);
        });
        $cell.append($formLink);
        $row.append($cell);
      });
      if (_.size(pageForms) < 3) {
        let remaining = 3 - _.size(pageForms);
        // Just using colspan didn't work.
        for (let r = 0; r < remaining; r++) {
          $row.append($("<td />"));
        }
      }
      $content.append($btnTable);
  }
    $("#main").html("")
      .append($content);
    M.AutoInit();
    let elem = $(".collapsible.expandable");
    let instance = M.Collapsible.init(elem, {
      accordion: false
    });
};

function navBtn(where, label) {
  let btnLabel = label ? label : where.replace(/^\W/, c => c.toUpperCase());
  let $li = $("<li />", {
    "id": where + "-menu",
    "class": "nav-solo nav-btn"
  });
  let $btn = $("<a />", {
    "class": "nav-child waves-effect",
    "text": btnLabel
  });
  $btn.click(() => {
    populate.populate(where);
    // If it was the current page, it will already be highlighted. Otherwise,
    // turn off whatever was the current page and highlight this one.
    if (!$li.hasClass("current")) {
      $(".current").removeClass("current");
      $li.addClass("current");
      // if ($btn.text() === "View all") {
      //   let parentID = "#" + where + "-dropdown";
      //   $(parentID).addClass("current");
      // }
    }
  });
  $li.append($btn);
  return $li;
}

function navBtnExpandable(page) {
  let $sec = $("<li />", {
    "id": page + "-dropdown",
    "class": "nav-parent"
  });
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
      "id": entry + "-menu",
      "text": pageData[entry].formTitle,
      "class": "waves-effect nav-btn"
    });
    $btn.click(() => {
      gen.makeForm(page, entry);
      if (!$li.hasClass("current")) {
        $(".current").removeClass("current");
        $li.addClass("current");
        // $sec.addClass("current");
      }
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
  let $dataBtn = navBtn("data", "View your data");
  let $prefsBtn = navBtn("preferences", "Edit preferences");
  $sidenav.append($divider)
    .append($dataBtn)
    .append($prefsBtn);
  $("#sidebar").append($sidenav);
};
