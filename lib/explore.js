var exports = module.exports = {};

function saveBtn(label) {
  let $btn = $("<button />", {
    "class": "export-results-btn",
    "text": `Export to ${label}...`
  });
  let $cell = $("<td />");
  $cell.append($btn);
  return $cell;
}

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
};

exports.dataElem = function() {
  let $div = $("<div />", {"id": "data-display"});
  return $div;
};

// Not currently being used, but probably should come back sometime.
exports.makeBtnTable = function() {
  let $btnTable = $("<table />");
  let $btnRow = $("<tr />");
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

function makeTableHeader(keys) {
  let $head = $("<thead />");
  let $row = $("<tr />");
  let $opsHeader = $("<th />", {
    "data-dynatable-header": "ops"
  });
  $row.append($opsHeader);
  _.forEach(keys, (key) => {
    let $cell = $("<th />", {
      "text": key
    });
    $row.append($cell);
  });
  $head.append($row);
  return $head;
}

/* ********* *
 * Dynatable *
 * ********* */
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
  // let first = uuid.split("-")[0];
  // return first + "...";
  return _.truncate(uuid, {
    length: 8
  });
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

function opsWriter(record) {
  let btnCloseTag = "</button>";
  let editBtn = `<button class="btn-flat table-btn" click=edit.edit(${record.uuid})>`;
  let editIcon = "<i class='material-icons'>edit</i>";
  let deleteBtn = `<button class="btn-flat table-btn" click=console.log("delete", ${record.uuid})>`;
  let deleteIcon = "<i class='material-icons'>delete</i>";
  editBtn += editIcon + btnCloseTag;
  deleteBtn += deleteIcon + btnCloseTag;
  // let cell = `<td class="entry-ops">${editBtn}${deleteBtn}</td>`;
  let result = editBtn + deleteBtn;
  console.log(result);
  return result;
}

// function rowWriter(rowIndex, record, columns, cellWriter) {
//   // let $row = $(defaultRowWriter(rowIndex, record, columns, cellWriter));
//   // console.log($row);
//   let row = "<tr>";
//   let btnCloseTag = "</button>";
//   let editBtn = `<button class="btn-flat table-btn" click=edit.edit(${record.uuid})>`;
//   let editIcon = "<i class='material-icons'>edit</i>";
//   let deleteBtn = `<button class="btn-flat table-btn" click=console.log("delete", ${record.uuid})>`;
//   let deleteIcon = "<i class='material-icons'>delete</i>";
//   editBtn += editIcon + btnCloseTag;
//   deleteBtn += deleteIcon + btnCloseTag;
//   let firstCell = `<td class="entry-ops">${editBtn}${deleteBtn}</td>`;
//   row += firstCell;
//   _.forEach(columns, (column) => {
//     row += cellWriter(column, record);
//   });
//   row += "</tr>";
//   console.log(firstCell);
//   return row;
// }

exports.pasteInSearch = function(text) {
  let $search = $("#dynatable-query-search-data-table");
  $search.val(text);
  $search.change();
};

function initDynatable() {
  let sortFncs = _.fromPairs(_.map(dataProc.keys, k => [k, "custom"]));
  let records = dataProc.entries;
  _.forEach(records, (record) => {
    record.ops = "bloop";
  });
  $("#data-table")
    .bind("dynatable:init", (e, dynatable) => {
      materialize();
      dynatable.sorts.functions.custom = customSort;
    })
    .dynatable({
      dataset: {
        // records: dataProc.entries,
        records: records,
        sortTypes: sortFncs,
        perPageDefault: 20,
        perPageOptions: [10, 20, 50, 100]
      },
      writers: {
        // _rowWriter: rowWriter,
        _attributeWriter: customAttributeWriter,
        ops: opsWriter,
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
    .append(makeTableHeader(dataProc.keys))
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
  let makeCsv = jsonexportAsync(dataProc.entries, {headers: dataProc.keys});
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

// Not currently in use.
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
