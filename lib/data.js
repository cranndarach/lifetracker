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
  let $div = $("<div />", {"id": "data-space"})
    .append(exports.searchSection())
    .append($("<div />", {"id": "data-display"}));
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

exports.getFields = function() {
  exports.fields = [];
  return Promise.map(exports.data, (entry) => {
    let keys = Object.keys(entry);
    keys.forEach((k) => {
      if (!_.includes(exports.fields, k)) {
        exports.fields.push(k);
      }
    });
  })
  .catch((err) => {
    console.log(err.stack);
  });
};

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
  _.forEach(criteria, (searchText, field) => {
    if (obj[field] && obj[field].includes(searchText)) {
      console.log(obj);
      return True;
    }
  });
}

exports.search = function() {
  let $queryRows = $("#filter .query-row");
  let criteria = {};
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
  exports.found = _.filter(exports.data, (entry) => {
    return matchCriteria(entry, criteria);
  });
  // exports.found = results;
  $("#data-display").html(tableify({data: exports.found}))
    .append(exports.makeBtnTable());
  // Promise.map(criteria, (cr) => {
  //   return Promise.join(getSelected(cr), getSearchValue(cr), (selected, find) => {
  //     var results = {fields: selected, query: find};
  //     return results;
  //   });
  // })
  //   .then((criteria) => {
  //     return Promise.filter(exports.data, (entry) => {
  //       return Promise.all(Promise.map(criteria, (criterion) => {
  //         return Promise.filter(Object.keys(entry), (k) => {
  //           // Get only the keys present in the entry.
  //           let presence = arrMember.member(k, criterion.fields);
  //           return presence;
  //         }) // End of filter(keys)
  //           .then((keys) => {
  //             // console.log(keys);
  //             return Promise.all(Promise.map(keys, (key) => {
  //               return entry[key];
  //             }));
  //           }) // End of then(keys)
  //           .then((values) => {
  //             return new Promise((resolve, reject) => {
  //               if (arrMember.member(criterion.query, values, kind="contains")) {
  //                 // If one criterion is a match, resolve.
  //                 resolve(true);
  //               } else {
  //                 resolve(false);
  //               }
  //             });
  //           }); // End of then((values))
  //       })) // End of all(criteria)
  //         // .filter((results) => {
  //         //   return arrMember.member(true, results);
  //         // });
  //       // This part says whether to keep the entry.
  //       // It's literally just filtering the results of checking each
  //       // criterion. It returns an array of all the "true" results.
  //         .filter((results) => {
  //           // Return an array containing only true results.
  //           return results;
  //         })
  //         .then((res) => {
  //           // console.log(res);
  //           // If there was at least one true result, send "true" to the filter
  //             if (res.length >= 1) {
  //               return true;
  //             } else {
  //               return false;
  //             }
  //         });
  //     }); // End of filter(entries)
  //   }) // End of then(criteria)
  //     // Now tableify
  //     .then((found) => {
  //       exports.displayData = tableify({data: found});
  //       exports.found = found;
  //       var dataDiv = document.getElementById("data-display");
  //       dataDiv.innerHTML = exports.displayData;
  //       dataDiv.innerHTML += exports.buttons;
  //     }); // End of then(found)
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
