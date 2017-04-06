var exports = module.exports = {};

exports.queryRow = `
  <fieldset>
    <p>
      <label>In which fields?</label>
    </p>
    <p>
      <select multiple class="fields">
      </select>
    </p>
    <p>
      <label>Search for:</label>
    </p>
    <p>
      <input class="form-control" name="query" type="text" />
    </p>
  </fieldset>`;

exports.searchHTML = `
  <div id="access-data" class="form">
    <div class="form-group">
      <fieldset id="filter">
        <legend>Filter data:</legend>
        ${exports.queryRow}
      </fieldset>
    </div>
    <button class="btn btn-form btn-default" onclick="dataProc.addRow()">\
      Add row</button>
    <button class="btn btn-form btn-default" onclick="dataProc.search()">Search\
      </button>
  </div>`;

exports.dataHTML = `
  <div id="data-space">
    ${exports.searchHTML}
  </div>
  <table>
  <tr><td><button class="btn btn-large btn-positive"\
    onclick=dataProc.toCSV()>Export data...</button>
  </td></tr>
  </table>
  <div id="data-display"></div>`;


exports.getFields = function() {
  var fieldsPromise = new Promise((fulfill, reject) => {
    exports.fields = [];
    let dbPath = config.data.saveDir + "/all-data.json";
    jsonfile.readFile(dbPath, (err, data) => {
      if (err) {
        console.log(err.stack);
        console.log("Could not load data file.");
        return;
      } else {
        exports.data = data;
        data.forEach((entry) => {
          let keys = Object.keys(entry);
          keys.forEach((k) => {
            if (!arrMember.member(k, exports.fields)) {
              exports.fields.push(k);
              addIfPossible(k);
            }
          });
        });
      }
    });
    // return fields;
    // exports.fields = fields;
    // exports.fieldSelect = "";
    fulfill(exports.fields);
  });
  return fieldsPromise;
};

function addIfPossible(field) {
  try {
    document.getElementsByClassName("fields")[0].innerHTML += `
      <option value="${field}">${field}</option>`;
    exports.fieldSelect = document.getElementsByClassName("fields")[0].innerHTML;
    return true;
  } catch (err) {
    return false;
  }
}

exports.addRow = function() {
  console.log(exports.fields);
  let searchArea = document.getElementById("filter");
  let newRow = document.createElement("div");
  newRow.class = "query form-group";
  newRow.innerHTML = exports.queryRow;
  let select = newRow.getElementsByTagName("select")[0];
  select.innerHTML = exports.fieldSelect;
  searchArea.appendChild(newRow);
};

// exports.addRow = function() {
//   document.getElementById("filter").innerHTML += exports.queryRow;
//   exports.fillFieldHTML();
// };

exports.search = function() {
  var criteria = document.getElementsByClassName("query");
  // Init the list that will hold the output.
  var found = [];
  // Iterate through each criterion.
  criteria.forEach((set) => {
    // In which fields?
    var fields = set.getElementsByTagName("select").selected.value;
    // Find what?
    var find = set.getElementsByTagName("input")[0].value;
    // For each entry in the main dataset
    exports.data.forEach((d) => {
      var candidates = [];
      fields.forEach((f) => {
        // Get the values of whatever fields are being queried
        candidates.push(d[f]);
      });
      // If the query value is in those fields, add the entry to "found" unless
      // it has been added already.
      if (arrMember.member(find, candidates, kind="contains")) {
        if (!arrMember.member(found, d)) {
          found.push(d);
        }
      }
    });
  });
  // Then tableify it.
  var display = tableify({data: found});
  document.getElementById("data-display").innerHTML = display;
};

// exports.getFields()
//   .then(exports.fillFieldHTML)
//   .then(exports.fillQueryHTML)
//   .then(exports.fillSearchHTML)
//   .then(exports.fillDataHTML);
