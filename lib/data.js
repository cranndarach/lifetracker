var exports = module.exports = {};

exports.data = [];

// This whole thing needs to be revamped. All data is saved in a master file
// now. So there can be a function to get all of the keys from the database,
// and possibly one to get everything in the "category" field.
//
// getFields() was written for the first requirement. Now there needs to be
// a call to getFields() with promises to define fieldSelect.

exports.getFields = function() {
  let dbPath = config.data.savedir + "all-data.json";
  let fields = jsonfile.readFile(dbPath, (err, data) => {
    if (err) {
      console.log(err.stack);
      console.log("Could not load data file.");
      return [];
    } else {
      let fields = [];
      for (let i = 0; i < data.length; i++) {
        let keys = Object.keys(data[i]);
        for (let j = 0; j < entry.length; j++) {
          if (!arrMember.member(keys[j], fields)) {
            fields.push(keys[j]);
          }
        }
      }
      return fields;
    }
  });
  return fields;
};

exports.dataHTML = `
  <div id="data-space">
    ${exports.searchHTML}
  </div>
  <table>
  <th><h2>Data</h2></th>
  <tr><td><button class="btn btn-large btn-positive"\
    onclick=dataProc.toCSV()>Export data...</button>
  </td></tr>
  </table>`;

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

exports.addRow = function() {
  document.getElementById("query").innerHTML += exports.queryRow;
};

exports.search = function() {
  // var group = document.getElementById("query");
  var criteria = document.getElementsByClassName("query");
  var found = [];
  criteria.forEach((set) => {
    // var fields = set.getElementsByTagName("select").selected.value;
    var find = set.getElementsByTagName("input")[0].value;
    exports.data.forEach((d) => {
      if (arrMember.objectValue(find, d)) {
        found.push(d);
      }
    });
  });
  var display = tableify({data: found});
  document.getElementById("data-space").innerHTML += display;
};

// exports.toCSV = function() {
//   jsonexport(exports.data, (err, csvString) => {
//     if (err) {
//       console.log(err.stack);
//     }
//     console.log(csvString);
//     var date = new Date().toLocaleDateString().replace(/\//g,'-');
//     remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
//       title: `Save as...`,
//       defaultPath: require('path').join(config.saveDir, "..",
//                         `lifetracker_data_${date}.csv`),
//       filters: [
//         {name: ".CSV files", extensions: ['csv']},
//         {name: "All files", extensions: ['*']}
//       ]
//     }, (filename) => {
//       fs.writeFile(filename, csvString, (err) => {
//         if (err) {
//           console.log(err.stack);
//         }
//         console.log(`Data saved to ${filename}.`);
//       });
//     });
//   });
// };
