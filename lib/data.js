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
  var fieldsPromise = new Promise((fulfill, reject) => {
    exports.fields = [];
    let dbPath = config.data.saveDir + "/all-data.json";
    readJSON(dbPath)
      .map((entry) => {
        let keys = Object.keys(entry);
        keys.forEach((k) => {
          if (!arrMember.member(k, exports.fields)) {
            exports.fields.push(k);
          }
        });
      })
      .then(() => {
        return new Promise((fulfill, reject) => {
          exports.fieldSelect = "";
          fulfill(exports.fields);
        });
      })
      .map((field) => {
        exports.fieldSelect += `<option value="${field}">${field}</option>`;
      }).then(fulfill(exports.fieldSelect));
      // fulfill(exports.fields);
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
  var selectionPromise = new Promise((fulfill, reject) => {
    fulfill(criterion.getElementsByTagName("option"));
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
  return new Promise((fulfill, reject) => {
    fulfill(criterion.getElementsByTagName("input")[0].value);
  });
}

exports.search = function() {
  var found = [];
  // new Promise((fulfill, reject) => {
  var filter = document.getElementById("filter");
  // fulfill(filter.getElementsByTagName("fieldset"));
  var criteria = filter.getElementsByTagName("fieldset");
  Promise.map(criteria, (criterion) => {
    Promise.join(getSelected(criterion), getSearchValue(criterion), (selected, find) => {
      Promise.map(exports.data, (entry) => {
        selected.map((field) => {
          return entry[field];
        })
          .then((value) => { 
            return new Promise((fulfill, reject) => {
              fulfill(arrMember.member(find, value, kind="contains"));
            });
          })
          .then((success) => {
            if (success) {
              if (!arrMember.member(entry, found)) {
                found.push(entry);
              }
            }
          });
      });
    });
  })
    .then((out) => {
      return new Promise((fulfill, reject) => {
        // Then tableify it.
        var display = tableify({data: out});
        fulfill(display);
      });
    })
    .then((display) => {
      exports.displayData = display;
      document.getElementById("data-display").innerHTML = display;
    });
};
