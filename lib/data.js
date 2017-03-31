var exports = module.exports = {};

exports.data = [];

// This whole thing needs to be revamped. All data is saved in a master file
// now. So there can be a function to get all of the keys from the database,
// and possibly one to get everything in the "category" field.
//
// getFields() was written for the first requirement. Now there needs to be
// a call to getFields() with promises to define fieldSelect.

exports.getFields = function() {
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
          }
        });
      });
      // for (let i = 0; i < data.length; i++) {
      //   let keys = Object.keys(data[i]);
      //   for (let j = 0; j < keys.length; j++) {
      //     if (!arrMember.member(keys[j], fields)) {
      //       fields.push(keys[j]);
      //     }
      //   }
      // }
      // return fields;
    }
  });
  // return fields;
};

var fieldsPromise = new Promise((fulfill, reject) => {
  exports.getFields();
  fulfill(exports.fields);
});

// Definition of exports.fieldSelect
fieldsPromise.then((fields) => {
  exports.fieldSelect = "";
  fields.forEach((field) => {
    exports.fieldSelect.push(`<option value="${field}">${field}</option>`);
  });
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
    <!--button class="btn btn-form btn-default"\
      onclick="dataProc.combineData(dataProc.addRow())">Add row</button>
    <button class="btn btn-form btn-default"\
      onclick="dataProc.combineData(dataProc.search())">Search</button-->
    </div>`;

  exports.queryRow = `
    <div class="query">
      <label>In which fields?</label>
      <select multiple>
        ${exports.fieldSelect}
      </select>
      <input class="form-control" name="query" type="text" />
    </div>`;
});

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
