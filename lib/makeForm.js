var exports = module.exports = {};

function appendZero(val) {
  if (val.length === 1) {
    val = "0" + val;
  }
  return val;
}

exports.tabComplete = function(e) {
  let $current = $(e.target);
  let $next = $current.parent().next().children("input, textarea, button");
  let $highlighted = $(".autocomplete-content li:hover, .autocomplete-content li.active");
  if ($highlighted.length) {
    $current.val($highlighted.text());
  } else if ($(".autocomplete-content li").length) {
    let $first = $(".autocomplete-content li:first-child");
    if ($first.text() === $current.val()) {
      $next.focus();
    } else {
      $current.val($first.text());
    }
  } else {
    $next.focus();
  }
};

exports.makeFormHTML = function(page, formName) {
  let form = _.omit(forms[page][formName], "formTitle");
  return new Promise((resolve, reject) => {
    form.head = $("<h1 />", {html: forms[page][formName].formTitle});
    form.notes = $("<div />", {class: "form-group input-field"});
    form.notes.append($("<label />", {
      for: "notes",
      text: "Notes"
    }))
      .append($("<textarea />", {
        class: "form-control materialize-textarea",
        name: "notes",
        id: "notes"
      }));
    form.tags = $("<div />", {class: "form-group input-field"});
    form.tags.append($("<label />", {
      for: "tags",
      text: "Tags"
    }))
      .append($("<input />", {
        class: "form-control",
        type: "text",
        name: "tags",
        id: "tags"
      }));
    form.actionDiv = $("<div />", {class: "form-group"});
    // form.actionDiv.append($("<p />"))
    let $savePresetBtn = $("<button />", {
      id: "save-preset-trigger",
      class: "btn-no-accent modal-trigger",
      "data-target": "save-preset-modal",
      text: "Save as a quick entry"
    });
    let $submitBtn = $("<button />", {
      id: "submit",
      class: "submit-btn",
      text: "Submit"
    });
    $submitBtn.click(() => {
      submit.submit();
    });
    form.actionDiv.append($savePresetBtn)
      .append($submitBtn)
      .append("&ensp;")
      .append($("<span />", {id: "submit-message"}));
    resolve(form);
  })
  .then((form) => {
    form.body = $("<form />", {
      class: "form",
      id: "form-body"
    });
    return Promise.each(_.keys(form.fields), (fieldName) => {
      let field = form.fields[fieldName];
      let fieldConfig = _.omit(field, ["label"]);
      fieldConfig.name = fieldConfig.name ? fieldConfig.name : fieldName;
      fieldConfig.id = fieldConfig.id ? fieldConfig.id : fieldName;
      // console.log(field);
      let fieldDiv = $("<div />", {class: "form-group"});
      let fieldInput = $("<input />", fieldConfig);
      fieldInput.addClass("form-control");
      fieldDiv.append($("<label />", {
        for: fieldName,
        // class: "col s12",
        text: field.label
      }))
        .append(fieldInput);
      switch (field.type) {
        case "text":
          if (fieldName === "category") {
            fieldInput.addClass("autocomplete");
          }
          fieldDiv.addClass("input-field");
          if (fieldInput.val() || fieldInput.prop("placeholder")) {
            fieldDiv.children("label").addClass("active");
          }
          break;
        case "range":
          fieldDiv.addClass("range-field");
          break;
        default:
          break;
      }
      form.body.append(fieldDiv);
    })
    .then((fields) => {
      return new Promise((resolve, reject) => {
        form.body.append(form.notes)
          .append(form.tags)
          .append(form.actionDiv);
        resolve(form);
      });
    });
  })
  .catch((err) => {
    console.log(err.stack);
  });
};

exports.makeForm = function(page, formName) {
  exports.makeFormHTML(page, formName)
    .then((form) => {
      return new Promise((resolve, reject) => {
        let content = $("<div />", {class: "content"});
        content.append(form.head)
          .append(form.body);
        $("#main").html("")
          .append(content)
          .append(presets.savePresetModal())
          .append(presets.makeConfirmOverwrite())
          .ready(() => {
            let today = moment().format("MMMM DD, YYYY");
            $("input.autocomplete").autocomplete({
              data: dataProc.categoryObj
            });
            $(".autocomplete").on("keydown", function(e) {
              if (e.which === 9) {
                e.preventDefault();
                exports.tabComplete(e);
              }
            });
            $("input.datepicker").datepicker({
              showClearBtn: true,
              defaultDate: today,
              setDefaultDate: true
            })
              .val(today)
              .siblings("label").addClass("active");
            $("input.timepicker").timepicker({
              showClearBtn: true
            })
              .each(function() {
                if (!$(this).val()) {
                  $(this).val(moment().format("hh:mm A"));
                }
              })
              .siblings("label").addClass("active");
            // $("input[type='datetime-local']").val(moment().format("YYYY-MM-DD"));
            // $(".modal").modal();
            let modalElems = document.querySelectorAll(".modal");
            let modals = M.Modal.init(modalElems, {
              preventScrolling: false
            });
            resolve();
          });
        
        resolve();
      });
    })
    .catch((err) => {
      console.log(err.stack);
    });
};
