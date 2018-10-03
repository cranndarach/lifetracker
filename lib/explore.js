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
    "data-dynatable-column": "ops",
    text: "Options"
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
function _genericFollowUp(a, b, col, direction) {
  if (b[col] > a[col]) {
    return -1*direction;
  } else {
    return direction;
  }
}

function _genericSort(a, b, col, direction, followUp, ...followArgs) {
  let aData = a[col];
  let bData = b[col];
  if (aData === bData) {
    // This includes if they're both "".
    return 0;
  } else if (!aData) {
    // Put a later regardless of direction.
    return 1;
  } else if (!bData) {
    // Put b later regardless of direction.
    return -1;
  } else {
    return followUp(a, b, col, direction, ...followArgs);
  }
}

function customSort() {
  return _genericSort(...arguments, _genericFollowUp);
}

function _genericDateTimeSort(a, b, col, direction, fmt) {
  let momentA = moment(a[col], fmt);
  let momentB = moment(b[col], fmt);
  if (momentA.isBefore(momentB)) {
    return -1*direction;
  } else if (momentA.isAfter(momentB)) {
    return direction;
  } else {
    // If you can't sort them chronologically, just sort normally?
    return customSort(a, b, col, direction);
  }
}

function dateSort() {
  let fmt = config.config.dateFormat;
  // Run the generic sort, follow with the date/time sort, using the right format.
  return _genericSort(...arguments, _genericDateTimeSort, fmt);
}

function timeSort() {
  let fmt = config.config.timeFormat;
  return _genericSort(...arguments, _genericDateTimeSort, fmt);
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
  let fmt = "MMM D, YYYY h:mm a";
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

exports.pasteInSearch = function(text) {
  let $search = $("#dynatable-query-search-data-table");
  $search.val(text);
  $search.change();
};

function opsButtons(entry) {
  let btnCloseTag = "</button>";
  let editBtn = `<button class="btn-flat table-btn" onclick="edit.edit('${entry.uuid}')">`;
  let editIcon = "<i class='material-icons'>edit</i>";
  let deleteBtn = `<button class="btn-flat table-btn" onclick="console.log('delete', '${entry.uuid}')">`;
  let deleteIcon = "<i class='material-icons'>delete</i>";
  editBtn += editIcon + btnCloseTag;
  deleteBtn += deleteIcon + btnCloseTag;
  // let cell = `<td class="entry-ops">${editBtn}${deleteBtn}</td>`;
  let result = editBtn + deleteBtn;
  // console.log(result);
  return result;
}

function getRecords() {
  return _.map(dataProc.entries, (entry) => {
    return _.assign(_.create({}, entry), {ops: opsButtons(entry)});
  });
}

function initDynatable() {
  // let sortFncs = _.fromPairs(_.map(dataProc.keys, k => [k, "custom"]));
  let dtTypes = ["start", "end", "when"];
  let dateCols = _.map(dtTypes, t => t + "Date");
  let timeCols = _.map(dtTypes, t => t + "Time");
  let sortFncs = _.fromPairs(_.map(dataProc.keys, (k) => {
    if (_.includes(dateCols, k)) {
      return [k, "dateSort"];
    } else if (_.includes(timeCols, k)) {
      return [k, "timeSort"];
    } else {
      return [k, "custom"];
    }
  }));
  // let records = _.create(dataProc, dataProc.data).entries;
  let records = getRecords();
  console.log(records);
  // _.forEach(records, (record) => {
  //   record.ops = "bloop";
  // });
  $("#data-table")
    .bind("dynatable:init", (e, dynatable) => {
      materialize();
      dynatable.sorts.functions.custom = customSort;
      dynatable.sorts.functions.dateSort = dateSort;
      dynatable.sorts.functions.timeSort = timeSort;
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
        // ops: opsWriter,
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
