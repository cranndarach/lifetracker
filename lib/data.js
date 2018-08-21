var exports = module.exports = {};
var readJSON = Promise.promisify(jsonfile.readFile);
var writeJSON = Promise.promisify(jsonfile.writeFile);
var jsoncsv = Promise.promisify(require('jsonexport'));
var saveDialog = Promise.promisify(dialog.showSaveDialog);
var writeFile = Promise.promisify(fs.writeFile);

function saveBtn(label) {
  let $btn = $("<button />", {
    "class": "export-results-btn waves-effect waves-light",
    "text": `Export to ${label}...`
  });
  let $cell = $("<td />");
  $cell.append($btn);
  return $cell;
}

exports.makeBtnTable = function() {
  let $btnTable = $("<table />");
  // exports.btnTable.append
  let $btnRow = $("<tr />");
  // $btnRow.append(saveBtn())
  let $csvBtn = saveBtn("CSV");
  $csvBtn.click(() => {
    exports.toCSV("found");
  });
  let $jsonBtn = saveBtn("JSON");
  $jsonBtn.click(() => {
    exports.toJSONFile();
  });
  $btnRow.append($csvBtn)
    .append($jsonBtn);
  $btnTable.append($btnRow);
  return $btnTable;
};

exports.makeQueryRow = function() {
  let $row = $("<div />", {"class": "card query-row"});
  let $fieldDiv = $("<div />", {"class": "form-group input-field"});
  $fieldDiv.append($("<label />", {
    "text": "In what fields?",
    "class": "active"
  }))
    .append(makeFieldSelect());
  let $searchDiv = $("<div />", {"class": "form-group input-field"});
  $searchDiv.append($("<label />", {
    "text": "Search for:"
  }))
    .append($("<input />", {
      "name": "query",
      "class": "form-control search-text",
      "type": "text"
    }));
  $row.append($fieldDiv)
    .append($searchDiv);
  return $row;
};

function makeFieldSelect() {
  let $select = $("<select />", {
    "class": "form-control",
    "multiple": "multiple"
  });
  // Don't keep trying to make a module-level options variable. It doesn't make sense.
  exports.fields.forEach((field) => {
    $select.append($("<option />", {
      // "class": "grey-text darken-4",
      "value": field,
      "text": field
    }));
  });
  return $select;
}

exports.searchSection = function() {
  let $div = $("<div />", {
    "id": "access-data",
    "class": "form"
  });
  let $group = $("<div />", {"class": "form-group"});
  let $fieldset = $("<fieldset />", {"id": "filter"})
    .append($("<legend />", {
      "text": "Filter data:"
    }))
    .append(exports.makeQueryRow());
  $group.append($fieldset);
  $addRow = $("<button />", {
    "id": "add-row",
    "class": "btn-no-accent",
    "text": "Add row"
  });
  $search = $("<button />", {
    "class": "search-btn",
    "text": "Search"
  });
  $btnRow = $("<div />", {
    "id": "btn-row",
    "class": "right"
  });
  $fieldset.append($btnRow);
  $btnRow.append($addRow)
    .append($search);
  $export = $("<button />", {
    "class": "export-btn",
    "text": "Export all to CSV..."
  });
  $addRow.click(() => {
    exports.addRow();
  });
  $search.click(() => {
    exports.search();
  });
  $export.click(() => {
    exports.toCSV("all");
  });
  $div.append($group)
    // .append($addRow)
    // .append($search)
    .append($export);
  return $div;
};

exports.dataElem = function() {
  let $div = $("<div />", {"id": "data-display"});
  // let $div = $("<div />", {"id": "data-space"})
  //   .append(exports.searchSection())
  //   .append($("<div />", {"id": "data-display"}));
  return $div;
};

exports.loadData = function() {
  let dbPath = config.config.saveDir + "/all-data.json";
  return readJSON(dbPath)
    .then((data) => {
      return new Promise((resolve, reject) => {
        exports.data = data;
        resolve();
      });
    })
    .catch((err) => {
      console.log("Data not found. Using an empty db.");
      return new Promise((resolve, reject) => {
        exports.data = [];
        resolve();
      });
    });
};

// exports.getFields = function() {
//   exports.fields = [];
//   return Promise.map(exports.data, (entry) => {
//     let keys = Object.keys(entry);
//     keys.forEach((k) => {
//       if (!_.includes(exports.fields, k)) {
//         exports.fields.push(k);
//       }
//     });
//   })
//   .catch((err) => {
//     console.log(err.stack);
//   });
// };

exports.addRow = function() {
  // $("#filter").append(exports.makeQueryRow());
  $("#btn-row").before(exports.makeQueryRow());
  M.AutoInit();
  // let instances = M.FormSelect.init(document.querySelectorAll("select"));
  // exports.selectInstances.push(instances);
};

exports.getCategories = function() {
  exports.categories = exports.categories ? exports.categories : [];
  return Promise.all(Promise.each(exports.data, (entry) => {
    let cat = entry.category;
    exports.updateCategories(cat);
  }))
    .catch((err) => {
      console.log(err.stack);
    });
};

exports.updateCategories = function(cat) {
  if (cat && !_.includes(exports.categories, cat)) {
    exports.categories.push(cat);
    exports.categoryObj = _.zipObject(exports.categories);
  }
};

function matchCriteria(obj, criteria) {
  return _.some(criteria, (searchText, field) => {
    return (obj[field] && obj[field].includes(searchText));
    // if (obj[field] && obj[field].includes(searchText)) {
    //   console.log(obj);
    //   exports.found.push(obj);
    // }
  });
}

exports.makeKeys = function() {
  // Get the set of unique keys from the data.
  exports.keys = _.uniq(_.flatten(_.map(exports.data, _.keys)));
};

function makeTableHeader(keys) {
  let $head = $("<thead />");
  let $row = $("<tr />");
  _.forEach(keys, (key) => {
    let $cell = $("<th />", {
      "text": key
    });
    $row.append($cell);
  });
  $head.append($row);
  return $head;
}

function defaultObject() {
  return _.fromPairs(_.map(exports.keys, (key) => [key, ""]));
}

function normalizeData(data) {
  let template = defaultObject();
  // If a field is missing from an entry, add it and set its value to an empty string.
  _.forEach(data, (entry) => {
    _.defaults(entry, template);
  });
  return data;
}

// Custom writer for dynatable.
function dateWriter(record, kind) {
  let fmt = "MMM D, YYYY h:mma";
  if (!record[kind]) { return ""; }
  return moment(record[kind]).format(fmt);
}

function startWriter(record) {
  return dateWriter(record, "start");
}

function endWriter(record) {
  return dateWriter(record, "end");
}

function whenWriter(record) {
  return dateWriter(record, "when");
}

function uuidWriter(record) {
  let uuid = record.uuid;
  let first = uuid.split("-")[0];
  return first + "...";
}

exports.displayData = function() {
  // Make a copy so that it doesn't add unnecessary fields to the real data.
  let data = _.cloneDeep(exports.data);
  // data = formatDates(data);
  data = normalizeData(data);
  let $table = $("<table />", {
    "id": "data-table",
    "class": "data-display-table striped responsive-table"
  })
    .append(makeTableHeader(exports.keys))
    .append($("<tbody />"));
  $("#data-display").html("")
    .append($table)
    .ready(() => {
      $table.dynatable({
        dataset: {
          records: data,
          perPageDefault: 20,
          perPageOptions: [10, 20, 50, 100]
        },
        writers: {
          start: startWriter,
          end: endWriter,
          when: whenWriter,
          uuid: uuidWriter
        }
      });
    })
    .append(exports.makeBtnTable());
};

exports.search = function() {
  let $queryRows = $("#filter .query-row");
  let criteria = {};
  exports.found = [];
  // Can't be an arrow fnc, because we need access to `this`.
  $queryRows.each(function() {
    let fieldsElem = $(this).find(".select-dropdown");
    let fieldsString = fieldsElem.val();
    let fields = fieldsString.split(", ");
    let searchText = $(this).find("input.search-text").val();
    _.forEach(fields, (field) => {
      if (criteria[field]) {
        criteria[field].push(searchText);
      } else {
        criteria[field] = [searchText];
      }
    });
  });
  console.log(criteria);
  return Promise.all(Promise.each(exports.data, (entry) => {
    if (matchCriteria(entry, criteria)) {
      console.log(entry);
      exports.found.push(entry);
    }
  }))
    .then(() => {
      exports.displayData();
    })
    .catch((err) => {
      console.log(err.stack);
    });
};

exports.toCSV = function(what) {
  var date = new Date().toLocaleDateString().replace(/\//g,'-');
  var opts = {
    title: `Save as...`,
    defaultPath: path.join(config.config.saveDir, "..", `lifetracker_data_${date}.csv`),
    filters: [
      {name: ".CSV files", extensions: ['csv']},
      {name: "All files", extensions: ['*']}
    ]
  };
  var dataToExport;
  if (what === "all") {
    dataToExport = exports.data;
  } else if (what === "found") {
    dataToExport = exports.found;
  }
  jsonexport(dataToExport, (err, csvstring) => {
    if (err) {
      console.log(err.stack);
      return;
    } else {
      console.log(csvstring);
    }
    dialog.showSaveDialog(opts, (filename) => {
      fs.writeFile(filename, csvstring, (err) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log("saved");
        }
      });
    });
  });
};

exports.toJSONFile = function() {
  var date = new Date().toLocaleDateString().replace(/\//g,'-');
  var opts = {
    title: `Save as...`,
    defaultPath: path.join(config.config.saveDir, "..", `lifetracker_data_${date}.json`),
    filters: [
      {name: ".JSON files", extensions: ['json']},
      {name: "All files", extensions: ['*']}
    ]
  };
  dialog.showSaveDialog(opts, (filename) => {
    jsonfile.writeFile(filename, exports.found, (err) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log("Saved.");
      }
    });
  });
};
