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
    $formBody.append($notes);
  }
  if (!_.includes(_.keys(form.fields), "tags")) {
    let $tags = $("<div />", {
      class: "form-group input-field"
    })
      .append($("<label />", {
        for: "tags",
        text: "Tags"
      }))
      .append($("<input />", {
        class: "form-control",
        type: "text",
        name: "tags",
        id: "tags"
      }));
    $formBody.append($tags);
  }
  // Buttons.
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
    .append($submitBtn);
    // .append("&ensp;")
    // .append($("<span />", {id: "message"}));
  // Add the buttons once everything else is done.
  $formBody.ready(() => {
    $formBody.append($actionDiv)
      .append($("<div />", {
        id: "message",
        class: "right-align"
      }));
  });
  return $formBody;
};

function makeField(field, fieldName) {
  let fieldConfig = _.omit(field, ["label"]);
  fieldConfig.name = fieldConfig.name ? fieldConfig.name : fieldName;
  fieldConfig.id = fieldConfig.id ? fieldConfig.id : fieldName;
  let $fieldDiv = $("<div />", {
    class: "form-group"
  });
  let $fieldInput = $("<input />", fieldConfig);
  if (fieldConfig.name === "notes") {
    $fieldInput = $("<textarea />", fieldConfig)
      .addClass("materialize-textarea");
    $fieldDiv.addClass("input-field");
    if (fieldConfig.value) {
      $fieldInput.text(fieldConfig.value);
      $fieldInput.val(null);
    }
  }
  $fieldInput.addClass("form-control");
  $fieldDiv.append($("<label />", {
    for: fieldName,
    text: field.label
  }))
    .append($fieldInput);
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
    id: "content"
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
  $(".autocomplete").on("keydown", function(e) {
    if ((e.which === 9) && (!e.shiftKey)) {
      e.preventDefault();
      exports.tabComplete(e);
    }
  });
  let today = moment().format(config.config.dateFormat);
  // let timeFmt = config.config.twelveHour ? "hh:mm A" : "HH:mm";
  let timeFmt = config.config.timeFormat;
  let dateFmt = config.config.dateFormat;
  $("input.datepicker").datepicker({
    format: "mmmm dd, yyyy",
    showClearBtn: true,
    defaultDate: today,
    setDefaultDate: true,
    parse: (input) => {
      return moment(input, dateFmt).toDate();
    },
    onOpen: function () {
      console.log(this);
    },
    onClose: function () {
      console.log(this);
      console.log(this.$el.val());
      let val = this.$el.val();
      if (val) {
        let result = moment(val, "MMMM DD, YYYY").format(dateFmt);
        this.$el.val(result);
      } else {
        this.$el.val(null);
        this.$el[0].focus();
      }
    }
  })
    .val(today)
    .siblings("label").addClass("active");
  $("input.timepicker").timepicker({
    showClearBtn: true,
    twelveHour: config.config.twelveHour,
    onCloseEnd: function () {
      console.log(this);
      let val = this.$el.val();
      // let time = this.time + (this.options.twelveHour ? (" " + this.amOrPm) : "");
      if (val) {
        let origFmt = "hh:mm" + (this.options.twelveHour ? " A" : "");
        let result = moment(val, origFmt).format(timeFmt);
        this.$el.val(result);
      } else {
        this.$el.val(null);
        this.$el[0].focus();
      }
    }
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
