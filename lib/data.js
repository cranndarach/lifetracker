var exports = module.exports = {};

function saveBtn(label) {
  let $btn = $("<button />", {
    "class": "export-results-btn waves-effect waves-light",
    "text": `Export to ${label}...`
  });
  let $cell = $("<td />");
  $cell.append($btn);
  return $cell;
}

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

exports.dataElem = function() {
  let $div = $("<div />", {"id": "data-display"});
  return $div;
};

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
          exports.data.push(reformatDates(entry));
        });
    });
}

function formatCurry(time, outputFmt) {
  return function(format) {
    tryFormat(format, time, outputFmt);
  };
}

function tryFormat(format, time, outputFmt) {
  if (moment(time, format).isValid()) {
    let output = moment(time, format).format(outputFmt);
    console.log(output);
    return output;
  } else {
    return false;
  }
}

function timeFmtPromise(entry) {
  let testTime = entry.startTime || entry.endTime || entry.whenTime;
  return new Promise((resolve, reject) => {
    // There isn't a good way to get the time format, so this is as good as I can probably get.
    let fmtCurry = formatCurry(testTime, config.config.timeFormat);
    resolve(fmtCurry("h:mm A") || fmtCurry("hh:mm A") || fmtCurry("H:MM") || fmtCurry("HH:MM"));
  })
    .then((fmtTime) => {
      return new Promise((resolve, reject) => {
        console.log(fmtTime);
        if (testTime && fmtTime && (testTime != fmtTime)) {
          if (entry.startTime) {
            entry.startTime = moment(entry.startTime).format(config.config.timeFormat);
          }
          if (entry.endTime) {
            entry.endTime = moment(entry.endTime).format(config.config.timeFormat);
          }
          if (entry.whenTime) {
            entry.whenTime = moment(entry.whenTime).format(config.config.timeFormat);
          }
        }
        resolve(entry);
      });
    });
}

function dateFmtPromise(entry) {
  return new Promise((resolve, reject) => {
    let testDate = entry.startDate || entry.endDate || entry.whenDate;
    let fmtDate = moment(testDate).format(config.config.dateFormat);
    if (testDate && testDate != fmtDate) {
      if (entry.startDate) {
        entry.startDate = moment(entry.startDate).format(config.config.dateFormat);
      }
      if (entry.endDate) {
        entry.endDate = moment(entry.endDate).format(config.config.dateFormat);
      }
      if (entry.whenDate) {
        entry.whenDate = moment(entry.whenDate).format(config.config.dateFormat);
      }
    }
    resolve(entry);
  });
}

function breakPromise(entry) {
  return new Promise((resolve, reject) => {
    // Break up the combined ones.
    if (entry.start) {
      entry.startDate = moment(entry.start).format(config.config.dateFormat);
      entry.startTime = moment(entry.start).format(config.config.timeFormat);
      entry = _.omit(entry, "start");
    }
    if (entry.end) {
      entry.endDate = moment(entry.end).format(config.config.dateFormat);
      entry.endTime = moment(entry.end).format(config.config.timeFormat);
      entry = _.omit(entry, "end");
    }
    if (entry.when) {
      entry.whenDate = moment(entry.when).format(config.config.dateFormat);
      entry.whenTime = moment(entry.when).format(config.config.timeFormat);
      entry = _.omit(entry, "when");
    }
    resolve(entry);
  });
}

function reformatDates(entry) {
  // I know this is annoying, but they each need access to the result of the previous.
  return timeFmtPromise(entry)
    .then((entry) => {
      return dateFmtPromise(entry);
    })
    .then((entry) => {
      return breakPromise(entry);
    });
}

exports.loadData = function() {
  exports.data = [];
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
};

exports.toCSV = function(what) {
  // var date = new Date().toLocaleDateString().replace(/\//g,'-');
  var date = moment().format("YYYY-MM-DD");
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
