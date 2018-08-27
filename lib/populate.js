var exports = module.exports = {};

exports.populate = function(page) {
  let $pageTitle = $("<h1 />");
  let $content = $("<div />", {
    id: "content"
  });
  $content.append($pageTitle);
  switch (page) {
    case "home":
      console.log("Displaying home page.");
      $pageTitle.text("LifeTracker");
      let $pageContent = $("<p>Please select a page from the sidebar.</p>");
      $("#home-menu").addClass("current");
      $content.append($pageContent);
      break;
    case "data":
      $pageTitle.text("Data");
      $content.append(dataProc.dataElem())
        .ready(() => {
          dataProc.displayData();
        });
      break;
    case "preferences":
      $pageTitle.text("Edit preferences");
      $content.append(prefs.prefsHTML());
      break;
    default:
      $pageTitle.text(forms[page].pageTitle);
      let $btnTable = $("<table />", {
        class: "button-table"
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
          class: "page-btn",
          text: value.formTitle
        });
        $formLink.click(() => {
          let $sideBtn = $("#" + key + "-menu").parent();
          if (!$sideBtn.hasClass("current")) {
            $(".current").removeClass("current");
            $sideBtn.addClass("current");
          }
          gen.renderForm(page, key, forms);
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
    .append($content)
    .ready(() => {
      materialize();
    });
};

function navBtn(where, label) {
  let btnLabel = label ? label : where.replace(/^\W/, c => c.toUpperCase());
  let $li = $("<li />", {
    id: where + "-menu",
    class: "nav-solo nav-btn"
  });
  let $btn = $("<a />", {
    class: "nav-child waves-effect",
    text: btnLabel
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

function navBtnExpandable(page, source) {
  let $section = $("<li />", {
    id: page + "-dropdown",
    class: "nav-parent"
  });
  // Originally div. Not sure which is better; check here if things are weird.
  let $head = $("<a />", {
    class: "collapsible-header waves-effect",
    text: source[page].pageTitle
  });
  let $viewAll = navBtn(page, "View all");
  $viewAll.removeClass("nav-solo");
  let $bodyWrapper = $("<div />", {
    class: "collapsible-body"
  });
  let $body = $("<ul />");
  $body.append($viewAll);
  let pageData = _.omit(source[page], "pageTitle");
  let entries = _.keys(pageData);
  _.forEach(entries, (entry) => {
    let $li = $("<li />");
    let $btn = $("<a />", {
      id: entry + "-menu",
      text: pageData[entry].formTitle,
      class: "waves-effect nav-btn"
    });
    $btn.click(() => {
      gen.renderForm(page, entry, source);
      if (!$li.hasClass("current")) {
        $(".current").removeClass("current");
        $li.addClass("current");
      }
    });
    $li.append($btn);
    $body.append($li);
  });
  $bodyWrapper.append($body);
  $section.append($head)
    .append($bodyWrapper);
  return $section;
}

function makeExpandableSection(source) {
  let pages = _.keys(source);
  let $section = $("<ul />", {
    class: "collapsible expandable"
  });
  _.forEach(pages, (page) => {
    $section.append(navBtnExpandable(page, source));
  });
  return $section;
}

exports.fillSidebar = function() {
  let $sidenav = $("<ul />", {
    id: "sidenav",
    class: "sidenav sidenav-fixed"
  });
  let $homeBtn = navBtn("home", "Home");
  let $defaultSection = makeExpandableSection(forms);
  let $presetsSection = makeExpandableSection(presets.presets);
  let $divider = $("<li><div class='divider'></div></li>");
  let $dividerTwo = $divider.clone();
  let $dataBtn = navBtn("data", "View your data");
  let $prefsBtn = navBtn("preferences", "Edit preferences");
  $sidenav.append($homeBtn)
    .append($defaultSection)
    .append($divider)
    .append($presetsSection)
    .append($dividerTwo)
    .append($dataBtn)
    .append($prefsBtn);
  $("#sidebar").append($sidenav);
};

function materialize() {
  M.AutoInit();
  // let elem = $(".collapsible.expandable");
  // let instance = M.Collapsible.init(elem, {
  //   accordion: false
  // });
}
