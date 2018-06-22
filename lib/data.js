var exports = module.exports = {};
var readJSON = Promise.promisify(jsonfile.readFile);
var writeJSON = Promise.promisify(jsonfile.writeFile);
var jsoncsv = Promise.promisify(require('jsonexport'));
var saveDialog = Promise.promisify(dialog.showSaveDialog);
var writeFile = Promise.promisify(fs.writeFile);

function saveBtn(label) {
  let $btn = $("<button />", {
    "class": "btn btn-large btn-positive waves-effect waves-light",
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
  let $row = $("<fieldset />");
  let $fieldDiv = $("<div />", {"class": "form-group input-field"});
  $fieldDiv.append($("<label />", {
    "for": "fields",
    "text": "In what fields?"
  }))
    .append($("<select />", {
      "id": "fields",
      "class": "form-control",
      "name": "select-field",
      "multiple": "multiple"
    }));
  let $searchDiv = $("<div />", {"class": "form-group input-field"});
  $searchDiv.append($("<label />", {
    "for": "query",
    "text": "Search for:"
  }))
    .append($("<input />", {
      "id": "query",
      "name": "query",
      "class": "form-control",
      "type": "text"
    }));
  $row.append($fieldDiv)
    .append($searchDiv);
  return $row;
};

exports.searchSection = function() {
  let $div = $("<div />", {
    "id": "access-data",
    "class": "form"
  });
  let $group = $("<div />", {"class": "form-group"});
  let $fields = $("<fieldset />", {"id": "filter"})
    .append($("<legend />", {
      "text": "Filter data:"
    }))
    .append(exports.makeQueryRow());
  $group.append($fields);
  $addRow = $("<button />", {
    "class": "btn btn-form btn-default",
    "text": "Add row"
  });
  $search = $("<button />", {
    "class": "btn btn-form btn-default",
    "text": "Search"
  });
  $export = $("<button />", {
    "class": "btn btn-form btn-positive",
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
    .append($addRow)
    .append($search)
    .append($export);
  return $div;
};

exports.dataElem = function() {
  let $div = $("<div />", {"id": "data-space"})
    .append(exports.searchSection())
    .append($("<div />", {"id": "data-display"}));
  return $div;
  // var html = `
  // <div id="data-space">
  //   ${exports.searchHTML()}
  // </div>
  // <div id="data-display"></div>`;
  // return html;
};

exports.loadData = function() {
  let dbPath = config.config.saveDir + "/all-data.json";
  return readJSON(dbPath)
    .then((data) => {
      return new Promise((resolve, reject) => {
        exports.data = data;
        resolve(data);
      });
    })
    .catch((err) => {
      // console.log(err.stack);
      console.log("Data not found. Using an empty db.");
      return new Promise((resolve, reject) => {
        exports.data = [];
        resolve([]);
      });
    });
};

exports.getFields = function(data) {
  // var fieldsPromise = new Promise((resolve, reject) => {
    exports.fields = [];
    // exports.loadData()
    return Promise.map(data, (entry) => {
      let keys = Object.keys(entry);
      keys.forEach((k) => {
        if (!arrMember.member(k, exports.fields)) {
          exports.fields.push(k);
        }
      });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        exports.fieldSelect = "";
        resolve(exports.fields);
      });
    })
    .then((fields) => {
      return Promise.each(fields, (field) => {
        exports.fieldSelect += `<option value="${field}">${field}</option>`;
      });
    })
    .catch((err) => {
      console.log(err);
    });
    // .map((field) => {
      // exports.fieldSelect += `<option value="${field}">${field}</option>`;
    // })
    // .then(resolve);
    // .then(resolve(exports.fieldSelect));
    // resolve(exports.fields);
  // });
  // return fieldsPromise;
};

exports.addRow = function() {
  let $newRow = $("<div />", {"class": "query form-group"})
    .append(exports.makeQueryRow());
  $("#filter").append($newRow);
  // let newRow = document.createElement("div");
  // newRow.class = "query form-group";
  // newRow.innerHTML = exports.makeQueryRow();
  // document.getElementById("filter").appendChild(newRow);
};

exports.getCategories = function(data) {
  exports.categories = exports.categories ? exports.categories : [];
  // exports.categoryTags = exports.categoryTags ? exports.categoryTags : "";
  return Promise.all(Promise.each(data, (entry) => {
  // exports.data.forEach((entry) => {
  // return Promise.each(exports.data, (entry) => {
    let cat = entry.category;
    exports.updateCategories(cat);
    // if (!arrMember.member(cat, exports.categories)) {
    //   exports.categories.push(cat);
    // }
  }));
  // });
};

// exports.makeCategoryOptions = function() {
//   // Make an array of option tags from the categories for later pages to use.
//   let cats = dataProc.categories;
//   console.log(cats);
//   exports.categoryTags = cats.map((cat) => {
//     return `<option value="${cat}" />`;
//   });
// };

exports.updateCategories = function(cat) {
  if (cat && !_.includes(exports.categories, cat)) {
    exports.categories.push(cat);
    exports.categoryObj = _.zipObject(exports.categories);
    // exports.categoryTags += `<option value="${cat}" />\n`;
  }
};

function getSelected(criterion) {
  // Start with an array of all the <option> tags for one criterion.
  var selectionPromise = new Promise((resolve, reject) => {
    resolve(criterion.getElementsByTagName("option"));
  })
    // Filter using a function that returns true if the option is selected.
    .filter((option) => {
      return option.selected;
    })
    // Return the value of each selected option tag. And leave the promise like
    // that so that what calls it can call map on it.
    .map((selected) => {
      return selected.value;
    });
  return selectionPromise;
}

function getSearchValue(criterion) {
  return new Promise((resolve, reject) => {
    resolve(criterion.getElementsByTagName("input")[0].value);
  });
}

exports.search = function() {
  var filter = document.getElementById("filter");
  var criteria = filter.getElementsByTagName("fieldset");
  Promise.map(criteria, (cr) => {
    return Promise.join(getSelected(cr), getSearchValue(cr), (selected, find) => {
      var results = {fields: selected, query: find};
      return results;
    });
  })
    .then((criteria) => {
      return Promise.filter(exports.data, (entry) => {
        return Promise.all(Promise.map(criteria, (criterion) => {
          return Promise.filter(Object.keys(entry), (k) => {
            // Get only the keys present in the entry.
            let presence = arrMember.member(k, criterion.fields);
            return presence;
          }) // End of filter(keys)
            .then((keys) => {
              // console.log(keys);
              return Promise.all(Promise.map(keys, (key) => {
                return entry[key];
              }));
            }) // End of then(keys)
            .then((values) => {
              return new Promise((resolve, reject) => {
                if (arrMember.member(criterion.query, values, kind="contains")) {
                  // If one criterion is a match, resolve.
                  resolve(true);
                } else {
                  resolve(false);
                }
              });
            }); // End of then((values))
        })) // End of all(criteria)
          // .filter((results) => {
          //   return arrMember.member(true, results);
          // });
        // This part says whether to keep the entry.
        // It's literally just filtering the results of checking each
        // criterion. It returns an array of all the "true" results.
          .filter((results) => {
            // Return an array containing only true results.
            return results;
          })
          .then((res) => {
            // console.log(res);
            // If there was at least one true result, send "true" to the filter
              if (res.length >= 1) {
                return true;
              } else {
                return false;
              }
          });
      }); // End of filter(entries)
    }) // End of then(criteria)
      // Now tableify
      .then((found) => {
        exports.displayData = tableify({data: found});
        exports.found = found;
        var dataDiv = document.getElementById("data-display");
        dataDiv.innerHTML = exports.displayData;
        dataDiv.innerHTML += exports.buttons;
      }); // End of then(found)
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
