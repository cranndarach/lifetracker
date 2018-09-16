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

function makeNotes() {
  let $notes = $("<div />", {
    class: "form-group input-field"
  })
    .append($("<label />", {
      for: "notes",
      text: "Notes"
    }))
    .append($("<textarea />", {
      class: "form-control materialize-textarea",
      name: "notes",
      id: "notes"
    }));
  return $notes;
}

function makeTags() {
  let $tags = $("<div />", {
    class: "form-group chips chips-autocomplete",
    id: "tags"
  });
  let $label = $("<label />", {
    text: "Tags"
  });
  let $input = $("<input />", {
    class: "form-control chips-input",
    // type: "text",
    name: "tags",
    id: "tags-input",
    focusin: function() {
      $label.addClass("active");
    },
    focusout: function() {
      if (!M.Chips.getInstance($tags).chipsData.length) {
        $label.removeClass("active");
      }
    }
  });
  $tags.append($label)
    .append($input);
  return $tags;
}

exports.makeForm = function(page, formName, source) {
  let form = _.omit(source[page][formName], "formTitle");
  let $formBody = $("<div />", {
    class: "form",
    id: "form-body"
  });
  _.forEach(form.fields, (field, fieldName) => {
    $formBody.append(makeField(field, fieldName));
  });
  // Notes and tags.
  if (!_.includes(_.keys(form.fields), "notes")) {
    let $notes = makeNotes();
    $formBody.append($notes);
  }
  if (!_.includes(_.keys(form.fields), "tags")) {
    let $tags = makeTags();
    $formBody.append($tags);
  }
  // Buttons
  let $actionDiv = $("<div />", {
    class: "form-actions"
  });
  let $savePresetBtn = $("<button />", {
    id: "save-preset-trigger",
    class: "btn-no-accent modal-trigger",
    "data-target": "save-preset-modal",
    text: "Save as a quick entry"
  });
  let $submitBtn = $("<button />", {
    id: "submit-btn",
    class: "submit-btn",
    text: "Submit"
  });
  $submitBtn.click(() => {
    submit.submit();
  });
  $actionDiv.append($savePresetBtn)
    .append($submitBtn)
    .append("&ensp;")
    .append($("<span />", {id: "message"}));
  // Add the buttons once everything else is done.
  $formBody.ready(() => {
    $formBody.append($actionDiv);
  });
  return $formBody;
};

function makeField(field, fieldName) {
  let fieldConfig = _.omit(field, ["label"]);
  fieldConfig.name = fieldConfig.name || fieldName;
  fieldConfig.id = fieldConfig.id || fieldName;
  let $fieldDiv = $("<div />", {
    class: "form-group"
  });
  let $fieldInput = $("<input />", fieldConfig);
  $fieldInput.addClass("form-control");
  $fieldDiv.append($("<label />", {
    for: fieldName,
    text: field.label
  }))
    .append($fieldInput);
  if ($fieldInput.hasClass("chips-input")) {
    $fieldDiv.addClass("chips chips-autocomplete");
  }
  switch (field.type) {
    case "text":
      if (fieldName === "category") {
        $fieldInput.addClass("autocomplete");
      }
      $fieldDiv.addClass("input-field");
      if ($fieldInput.val() || $fieldInput.prop("placeholder")) {
        $fieldDiv.children("label").addClass("active");
      }
      break;
    case "range":
      $fieldDiv.addClass("range-field");
      break;
    default:
      break;
  }
  return $fieldDiv;
}

exports.renderForm = function(page, formName, source) {
  let $head = $("<h1 />", {
    text: source[page][formName].formTitle
  });
  let $formBody = exports.makeForm(page, formName, source);
  let $content = $("<div />", {
    class: "content"
  });
  $content.append($head)
    .append($formBody);
  $("#main").html("")
    .append($content)
    .append(presets.savePresetModal())
    .append(presets.makeConfirmOverwrite())
    .ready(() => {
      materialize();
    });
};

function materialize() {
  $("#category").autocomplete({
    data: dataProc.categoryObj
  });
  $("#preset-group").autocomplete({
    data: presets.groupsObj
  });
  $(".chips").chips();
  $("#tags").chips({
    autocompleteOptions: {
      data: dataProc.tagsObj
    }
  });
  // let chips = document.querySelectorAll(".chips");
  // M.Chips.init(chips);
  // let chipsAuto = document.querySelectorAll(".chips-autocomplete");
  // M.Chips.init(chipsAuto, {
  //   autocompleteOptions: {
  //     data: dataProc.tagsObj
  //   }
  // });
  $(".autocomplete, .chips-autocomplete").on("keydown", function(e) {
    if ((e.which === 9) && (!e.shiftKey)) {
      e.preventDefault();
      exports.tabComplete(e);
    }
  });
  let today = moment().format(config.config.dateFormat);
  let timeFmt = config.config.twelveHour ? "hh:mm A" : "HH:mm";
  let dateFmt = config.config.dateFormat;
  $("input.datepicker").datepicker({
    showClearBtn: true,
    defaultDate: today,
    setDefaultDate: true,
    parse: (input) => {
      return moment(input, dateFmt).toDate();
    },
    onClose: function () {
      let date = this.date;
      let result = moment(date).format(dateFmt);
      this.$el.val(result);
    }
  })
    .val(today)
    .siblings("label").addClass("active");
  $("input.timepicker").timepicker({
    showClearBtn: true,
    twelveHour: config.config.twelveHour
  })
    .each(function() {
      if (!$(this).val()) {
        $(this).val(moment().format(timeFmt));
      }
    })
    .siblings("label").addClass("active");
  let modalElems = document.querySelectorAll(".modal");
  let modals = M.Modal.init(modalElems, {
    preventScrolling: false
  });
  $(".tooltipped").tooltip();
}
