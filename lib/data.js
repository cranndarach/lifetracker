var exports = module.exports = {};

// exports.data = [];

// This whole thing needs to be revamped. All data is saved in a master file
// now. So there can be a function to get all of the keys from the database,
// and possibly one to get everything in the "category" field.
//
// getFields() was written for the first requirement. Now there needs to be
// a call to getFields() with promises to define fieldSelect.

exports.queryRow = `
  <div class="query">
    <label>In which fields?</label>
    <select multiple id="fields">
    </select>
    <input class="form-control" name="query" type="text" />
  </div>`;

exports.searchHTML = `<div id="access-data" class="form">
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
  <th><h2>Data</h2></th>
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
    document.getElementById("fields").innerHTML += `
      <option value="${field}">${field}</option>`;
    exports.fieldSelect = document.getElementById("fields").innerHTML;
    return true;
  } catch (err) {
    return false;
  }
}

exports.fillFieldHTML = function() {
  console.log(exports.fields);
  // var fieldHTMLPromise = new Promise((fulfill, reject) => {
    // var fieldSelect = "";
    // fields.forEach((field) => {
    for (let i = 0; i <= exports.fields.length; i++) {
      // if (i == fields.length) {
        // exports.fieldSelect = fieldSelect;
        // console.log(fieldSelect);
        // console.log(exports.fieldSelect);
        // fulfill(fieldSelect);
      // } else {
      // fieldSelect += `<option value="${field}">${field}</option>`;
      document.getElementById("fields").innerHTML += `
        <option value="${field}">${field}</option>`;
      exports.fieldSelect = document.getElementById("fields").innerHTML;
      // console.log(fieldSelect);
      // }
    }
    // exports.fieldSelect = fieldSelect;
    // Pause for some small amount of time to finish looping
    // setTimeout(() => {
    //   fulfill(fieldSelect);
    // }, 100);
  // });
  // return fieldHTMLPromise;
};

// exports.fillQueryHTML = function(fieldSelect) {
//   var queryPromise = new Promise((fulfill, reject) => {
//     let queryRow = `
//       <div class="query">
//         <label>In which fields?</label>
//         <select multiple class="fields">
//         </select>
//         <input class="form-control" name="query" type="text" />
//       </div>`;
//     exports.queryRow = queryRow;
//     fulfill(queryRow);
//   });
//   return queryPromise;
// };

// exports.fillSearchHTML = function(queryRow) {
//   var searchPromise = new Promise((fulfill, reject) => {
//     let searchHTML = `<div id="access-data" class="form">
//       <div class="form-group">
//         <fieldset id="filter">
//           <legend>Filter data:</legend>
//           ${queryRow}
//         </fieldset>
//       </div>
//       <button class="btn btn-form btn-default" onclick="dataProc.addRow()">\
//         Add row</button>
//       <button class="btn btn-form btn-default" onclick="dataProc.search()">Search\
//         </button>
//       </div>`;
//     exports.searchHTML = searchHTML;
//     fulfill(searchHTML);
//   });
//   return searchPromise;
// };

// exports.fillDataHTML = function(searchHTML) {
//   var dataPromise = new Promise((fulfill, reject) => {
//     let dataHTML = `
//       <div id="data-space">
//         ${searchHTML}
//       </div>
//       <table>
//       <th><h2>Data</h2></th>
//       <tr><td><button class="btn btn-large btn-positive"\
//         onclick=dataProc.toCSV()>Export data...</button>
//       </td></tr>
//       </table>
//       <div id="data-display"></div>`;
//     exports.dataHTML = dataHTML;
//     fulfill(dataHTML);
//   });
//   return dataPromise;
// };

exports.addRow = function() {
  document.getElementById("filter").innerHTML += exports.queryRow;
};

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
