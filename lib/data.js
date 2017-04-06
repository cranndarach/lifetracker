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
  // console.log(exports.fields);
  // let searchArea = document.getElementById("filter");
  let newRow = document.createElement("div");
  newRow.class = "query form-group";
  newRow.innerHTML = exports.queryRow();
  // let select = newRow.getElementsByTagName("select")[0];
  // select.innerHTML = exports.fieldSelect;
  document.getElementById("filter").appendChild(newRow);
};

// exports.addRow = function() {
//   document.getElementById("filter").innerHTML += exports.queryRow;
//   exports.fillFieldHTML();
// };

function getSelected(data) {
  var select = data.select;
  var selectedPromise = new Promise((fulfill, reject) => {
    let choice = [];
    let opts = select.getElementsByTagName("option");
    for (let i = 0; i < opts.length; i++) {
      if (opts[i].selected) {
        choice.push(opts[i].value);
      }
    }
    data.choice = choice;
    console.log(data.choice);
    fulfill(data);
  });
  return selectedPromise;
}

function findEntries(data) {
  var selected = data.choice;
  var find = data.find;
  var found = [];
  var promise = new Promise((fulfill, reject) => {
    exports.data.forEach((d) => {
      data.entry = d;
      newData = getCandidates(data).then((data) => {
        // let candidates = data.candidates;
        // If the query value is in those fields, add the entry to "found"
        // if (arrMember.member(find, candidates, kind="contains")) {
        //   found.push(d);
        // }
        return data;
      });
    });
    // data.found = found;
    fulfill(newData);
  });
  return promise;
}

function getCandidates(data) {
  let fields = data.choice;
  let entry = data.entry;
  var candPromise = new Promise((fulfill, reject) => {
    var candidates = [];
    fields.forEach((field) => {
      candidates.push(entry[field]);
      if (arrMember.member(find, candidates, kind="contains")) {
        found.push(d);
      }
    });
    data.candidates = candidates;
    fulfill(data);
  });
  return candPromise;
}

function getUnique(data) {
  let found = data.found;
  let out = data.out;
  var uniquePromise = new Promise((fulfill, reject) => {
    found.forEach((f) => {
      if (!arrMember.member(f, out)) {
        out.push(f);
      }
    });
    fulfill(out);
  });
  return uniquePromise;
}

exports.search = function() {
  var filter = document.getElementById("filter");
  var criteria = filter.getElementsByTagName("fieldset");
  console.log(criteria);
  // Init the list that will hold the output.
  // var out = [];
  // Iterate through each criterion.
  // criteria.forEach((set) => {
  for (let i = 0; i < criteria.length; i++) {
    // Find what?
    var find = criteria[i].getElementsByTagName("input")[0].value;
    // In which fields?
    var fields = criteria[i].getElementsByTagName("select")[0];
    var args = {
      find: find,
      select: fields,
      out: []
    };
    getSelected(args)
      .then(findEntries)
      .then(getUnique)
      .then((out) => {
        // Then tableify it.
        var display = tableify({data: out});
        document.getElementById("data-display").innerHTML = display;
      });
  }
};
