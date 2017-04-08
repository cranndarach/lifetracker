var exports = module.exports = {};
var readJSON = Promise.promisify(jsonfile.readFile);

exports.makeQueryRow = function() {
  var html = `<fieldset>
    <p>
      <label>In which fields?</label>
    </p>
    <p>
      <select multiple class="fields">
        ${exports.fieldSelect}
      </select>
    </p>
    <p>
      <label>Search for:</label>
    </p>
    <p>
      <input class="form-control" name="query" type="text" />
    </p>
  </fieldset>`;
  return html;
};

exports.searchHTML = function() {
  var html = `
  <div id="access-data" class="form">
    <div class="form-group">
      <fieldset id="filter">
        <legend>Filter data:</legend>
        ${exports.makeQueryRow()}
      </fieldset>
    </div>
    <button class="btn btn-form btn-default" onclick="dataProc.addRow()">\
      Add row</button>
    <button class="btn btn-form btn-default" onclick="dataProc.search()">Search\
      </button>
  </div>`;
  return html;
};

exports.dataHTML = function() {
  var html = `
  <div id="data-space">
    ${exports.searchHTML()}
  </div>
  <table>
  <tr><td><button class="btn btn-large btn-positive"\
    onclick=dataProc.toCSV()>Export data...</button>
  </td></tr>
  </table>
  <div id="data-display"></div>`;
  return html;
};


exports.getFields = function() {
  var fieldsPromise = new Promise((resolve, reject) => {
    exports.fields = [];
    let dbPath = config.data.saveDir + "/all-data.json";
    readJSON(dbPath)
      .then((data) => {
        return new Promise((resolve, reject) => {
          exports.data = data;
          resolve(data);
        });
      })
      .map((entry) => {
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
      .map((field) => {
        exports.fieldSelect += `<option value="${field}">${field}</option>`;
      }).then(resolve(exports.fieldSelect));
      // resolve(exports.fields);
    });
  return fieldsPromise;
};

exports.addRow = function() {
  let newRow = document.createElement("div");
  newRow.class = "query form-group";
  newRow.innerHTML = exports.makeQueryRow();
  document.getElementById("filter").appendChild(newRow);
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
      // Maybe just return?
      var results = {fields: selected, query: find};
      // console.log(results);
      return results;
    });
  })
    .then((criteria) => {
      return Promise.filter(exports.data, (entry) => {
        return Promise.all(Promise.map(criteria, (criterion) => {
          return Promise.filter(Object.keys(entry), (k) => {
            // Get only the keys present in the entry.
            let presence = arrMember.member(k, criterion.fields);
            console.log(k);
            console.log(presence);
            return presence;
          }) // End of filter(keys)
            .then((keys) => {
              console.log(keys);
              return Promise.all(Promise.map(keys, (key) => {
                return entry[key];
              }));
            }) // End of then(keys)
            .then((values) => {
              console.log(values);
              return new Promise((resolve, reject) => {
                if (arrMember.member(criterion.find, values, kind="contains")) {
                  // If one criterion is a match, resolve.
                  console.log("Got one.");
                  // return true;
                  resolve(true);
                } else {
                  console.log("Not a match.");
                  resolve(false);
                }
              });
            }); // End of then((values))
        })) // End of all(criteria)
        // This part says whether to keep the entry.
        // It's literally just filtering the results of checking each
        // criterion. It returns an array of all the "true" results.
          .filter((results) => {
            console.log(results);
            // Return an array containing only true results.
            return results;
          })
          .then((res) => {
            // If there was at least one true result, send "true" to the filter
            // return new Promise((resolve, reject) => {
              if (res.length >= 1) {
                return true;
                // resolve(true);
              } else {
                return false;
                // resolve(false);
              }
            // });
          });
      }); // End of filter(entries)
    }) // End of then(criteria)
      // Now tableify
      .then((found) => {
        console.log("Executing the last block now.");
        console.log(found);
        exports.displayData = tableify({data: found});
        exports.found = found;
        document.getElementById("data-display").innerHTML = exports.displayData;
      }); // End of then(found)
};
