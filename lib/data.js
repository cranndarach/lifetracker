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
  let dataKeys = _.uniq(_.flatten(_.map(exports.data, _.keys)));
  exports.keys = _.union(config.config.dataColumnOrder, dataKeys);
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

// Custom sort function for dynatable.
// Takes two records a and b, the column being sorted, and a direction (1 for
// ascending, -1 for descending). Returns a positive number if a is higher than
// b, a negative number if b is higher than a, and 0 if they're equal.
// Hint: Compare strings with > or <.
// Hint 2: A higher result means a later (spatially lower) place.
function customSort(a, b, col, direction) {
  let aData = a[col];
  let bData = b[col];
  if (aData === bData) {
    // This includes if they're both "".
    // console.log(aData + " and " + bData + " are equal.");
    return 0;
  } else if (!aData) {
    // Put a later regardless of direction.
    // console.log(bData + " is higher than " + aData);
    return 1;
  } else if (!bData) {
    // Put b later regardless of direction.
    // console.log(aData + " is higher than " + bData);
    return -1;
  } else if (bData > aData) {
    // Normal sort results if neither is "".
    // console.log(bData + " is higher than " + aData + " if ascending.");
    return -1*direction;
  } else {
    // console.log(aData + " is higher than " + bData + " if ascending.");
    return direction;
  }
}

// Generic custom attribute writer for dynatable, to handle missing data.
function customAttributeWriter(record) {
  if (record[this.id] === undefined) {
    return "";
  } else {
    return record[this.id];
  }
}

// Specific custom attribute writers for dynatable.
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

function tagsWriter(record) {
  if (!record.tags) {
    return "";
  }
  let tags = _.map(record.tags.split(","), str => str.trim());
  let html = "";
  _.forEach(tags, (tag) => {
    html += "<a class='tag' href='#' onclick=dataProc.pasteInSearch('" + tag + "')>" + tag + "</a>, ";
  });
  // Take off the last ", "
  let result = html.slice(0, -2);
  return result;
}

exports.pasteInSearch = function(text) {
  let $search = $("#dynatable-query-search-data-table");
  $search.val(text);
  $search.change();
};

function initDynatable() {
  let sortFncs = _.fromPairs(_.map(exports.keys, k => [k, "custom"]));
  $("#data-table")
    .bind("dynatable:init", (e, dynatable) => {
      dynatable.sorts.functions.custom = customSort;
    })
    .dynatable({
      dataset: {
        records: exports.data,
        sortTypes: sortFncs,
        perPageDefault: 20,
        perPageOptions: [10, 20, 50, 100]
      },
      writers: {
        _attributeWriter: customAttributeWriter,
        tags: tagsWriter,
        start: startWriter,
        end: endWriter,
        when: whenWriter,
        uuid: uuidWriter
      }
    });
}

exports.displayData = function() {
  let $table = $("<table />", {
    "id": "data-table",
    "class": "data-display-table striped responsive-table"
  })
    .append(makeTableHeader(exports.keys))
    .append($("<tbody />"));
  $("#data-display").html("")
    .append($table)
    .ready(() => {
      initDynatable();
    });
    // .append(exports.makeBtnTable());
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
