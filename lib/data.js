var exports = module.exports = {
  get entries() {
    return _.values(this.data);
  }
};

// Not currently being used, but probably should come back sometime.
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

function saveBtn(label) {
  let $btn = $("<button />", {
    "class": "export-results-btn",
    "text": `Export to ${label}...`
  });
  let $cell = $("<td />");
  $cell.append($btn);
  return $cell;
}

exports.dataElem = function() {
  let $div = $("<div />", {"id": "data-display"});
  return $div;
};

exports.csvButton = function() {
  let $wrapper = $("<div />", {
    id: "csv-btn-wrapper"
  });
  let $btn = $("<button />", {
    class: "export-results-btn",
    id: "csv-btn",
    text: "Export all data to CSV...",
    click: () => {
      exports.toCSV();
    }
  });
  $wrapper.append($btn);
  return $wrapper;
}

function backupData() {
  let allDataPath = path.join(config.config.saveDir, "all-data.json");
  return fs.copyFileAsync(allDataPath, allDataPath + ".bak");
}

function mergeData() {
  let dataPattern = path.join(config.config.saveDir, "data-*.json");
  return glob.globAsync(dataPattern)
    .each((fileName) => {
      return jsonfile.readFileAsync(fileName)
        .then((entry) => {
          // exports.data.push(reformatDates(entry));
          exports.data[entry.uuid] = reformatDates(entry);
        });
    });
}

function reformatDates(entry) {
  if (entry.timeFormat && (entry.timeFormat != config.config.timeFormat)) {
    entry.time = moment(entry.time, entry.timeFormat).format(config.config.timeFormat);
    entry.timeFormat = config.config.timeFormat;
  }
  if (entry.dateFormat && (entry.dateFormat != config.config.dateFormat)) {
    entry.date = moment(entry.date, entry.dateFormat).format(config.config.dateFormat);
    entry.dateFormat = config.config.dateFormat;
  }
  return entry;
}

exports.loadData = function() {
  // exports.data = [];
  exports.data = {};
  return backupData()
    .catch((err) => {
      if (err.code === "ENOENT") {
        console.log("No existing data file found. Starting a new one.");
        return new Promise.resolve();
      } else {
        throw err;
      }
    })
    .then(() => {
      return mergeData();
    });
};

exports.getCategories = function() {
  exports.categories = exports.categories ? exports.categories : [];
  return Promise.all(Promise.each(exports.entries, (entry) => {
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

exports.makeKeys = function() {
  // Get the set of unique keys from the data.
  let dataKeys = _.uniq(_.flatten(_.map(exports.entries, _.keys)));
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

function rowWriter(rowIndex, record, columns, cellWriter) {
  // let $row = $(defaultRowWriter(rowIndex, record, columns, cellWriter));
  // console.log($row);
  let row = "<tr>";
  let $firstCell = $("<td />", {
    class: "entry-ops"
  });
  let $editBtn = $("<button />", {
    class: "btn-flat table-btn",
    html: "<i class='material-icons'>edit</i>",
    click: () => {
      edit.edit(record);
    }
  });
  let $deleteBtn = $("<button />", {
    class: "btn-flat table-btn btn-warn",
    html: "<i class='material-icons'>delete</i>",
    click: () => {
      console.log("delete" + record.uuid);
    }
  });
  $firstCell.append($editBtn)
    .append($deleteBtn);
  let firstCell = $firstCell.prop("outerHTML");
  row += firstCell;
  _.forEach(columns, (column) => {
    row += cellWriter(column, record);
  });
  row += "</tr>";
  return row;
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
      materialize();
      dynatable.sorts.functions.custom = customSort;
    })
    .dynatable({
      dataset: {
        records: exports.entries,
        sortTypes: sortFncs,
        perPageDefault: 20,
        perPageOptions: [10, 20, 50, 100]
      },
      writers: {
        // _rowWriter: rowWriter,
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
};

function saveDialog(options) {
  // Because dialog.showSaveDialog() has a single-argument callback structure,
  // it couldn't be promisified in the normal way.
  return new Promise((resolve, reject) => {
    return dialog.showSaveDialog(options, (fileName) => {
      resolve(fileName);
    });
  });
}

exports.toCSV = function() {
  var date = moment().format("YYYY-MM-DD");
  var opts = {
    title: `Save as...`,
    defaultPath: path.join(config.config.saveDir, "..", `lifetracker_data_${date}.csv`),
    filters: [
      {name: ".CSV files", extensions: ['csv']},
      {name: "All files", extensions: ['*']}
    ]
  };
  let jsonexportAsync = Promise.promisify(jsonexport);
  let makeCsv = jsonexportAsync(exports.entries, {headers: exports.keys});
  let showDialog = saveDialog(opts);
  return Promise.join(makeCsv, showDialog, (csvString, fileName) => {
    console.log(csvString);
    return new Promise.resolve([csvString, fileName]);
  })
    .spread((csvString, fileName) => {
      return fs.writeFileAsync(fileName, csvString);
    })
    .then(() => {
      console.log("saved");
    })
    .catch((err) => {
      console.log(err.stack);
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

function materialize() {
  // addShowAll();
  $("select").formSelect();
  let $searchInput = $("#dynatable-search-data-table");
  // Remove text that isn't formatted as a label.
  $searchInput.contents().filter(function() {
    return (this.nodeType === 3);
  }).remove();
  $searchInput.addClass("input-field")
    .prepend($("<label />", {
    text: "Search",
    for: "dynatable-query-search-data-table"
  }));
}
