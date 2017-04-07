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
      .then((data) => {
        return new Promise((fulfill, reject) => {
          exports.data = data;
          fulfill(data);
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
      Promise.filter(exports.data, (entry) => {
        console.log(entry);
        // Tried `all` and `any`
        Promise.map(criteria, (criterion) => {
          Promise.filter(Object.keys(entry), (k) => {
            // Get only the keys present in the entry.
            let presence = arrMember.member(k, criterion.fields);
            console.log(presence);
            return presence;
          })
            // .then((keys) => {
            //   return new Promise((fulfill, reject) => {
            //     console.log(keys);
            //     fulfill(keys);
            //   });
            // })
            .map((key) => {
              // Get the values stored at those keys.
              console.log(key);
              return entry[key];
            })
            .then((values) => {
              return new Promise((fulfill, reject) => {
                if (arrMember.member(criterion.find, values, kind="contains")) {
                  // If one criterion is a match, fulfill.
                  console.log("Got one.");
                  fulfill(entry);
                } else {
                  console.log("Not a match.");
                  // If not, reject that criterion.
                  // reject("Not a match.");
                  fulfill(false);
                }
              });
              // When done checking criteria, pass the results back.
            });
        }); //)
        // I think this is already done?
          // When done checking criteria, return "true" to the filter if
          // the `any` fulfilled, or false if it didn't.
          // .map((truth) => {
          //   // .any(() => {
          //   return new Promise((fulfill, reject) => {
          //     if (truth) {
          //       console.log("Got one.");
          //       fulfill(true);
          //     } else {
          //       console.log("Not a match.");
          //       fulfill(false);
          //     }
          //   });
          // })
          // .catch(Promise.AggregateError, () => {
          //   console.log(entry);
          //   return false;
          // });
      })
        // When the entries have been filtered based on whether they match
        // the criteria, tableify them.
        .then((found) => {
          console.log("Executing the last block now.");
          console.log(found);
            // Then tableify it.
          // var display = tableify({data: found});
          exports.displayData = tableify({data: found});
          exports.found = found;
          document.getElementById("data-display").innerHTML = exports.displayData;
        });
    });
};


// exports.search = function() {
//   // var found = [];
//   var filter = document.getElementById("filter");
//   var criteria = filter.getElementsByTagName("fieldset");
//   Promise.map(criteria, (criterion) => {
//     return new Promise((fulfill, reject) => {
//       Promise.join(getSelected(criterion), getSearchValue(criterion), (selected, find) => {
//       // return new Promise((fulfill, reject) => {
//         Promise.map(exports.data, (entry) => {
//           Promise.map(selected, (field) => {
//             return new Promise((fulfill, reject) => {
//               let value = entry[field];
//               
//               // if (value == null) {
//               //   value = false;
//               // }
//               fulfill(value);
//             });
//           })
//             // arrMember.member searches an array, not a string. So we need
//             // to use `then` instead of `map`.
//             .then((values) => {
//               return new Promise((fulfill, reject) => {
//                 // if (values) {
//                 try {
//                   console.log(values);
//                   fulfill(arrMember.member(find, values, kind="contains"));
//                   console.log("Found a match.");
//                 } catch (err) {
//                   fulfill(false);
//                 }
//               });
//             })
//             // Likewise, `member` returns one truth value.
//             .then((success) => {
//               return new Promise((fulfill, reject) => {
//                 if (success) {
//                   if (!arrMember.member(entry, found)) {
//                     fulfill(entry);
//                   } else {
//                     reject("Entry is already saved.");
//                   }
//                 } else {
//                   reject("Entry is not a match.");
//                 }
//               });
//             })
//               .then((ent) => { found.push(ent); } )
//               .catch(console.log);
//         }).then(console.log("Worked through data."));
//         // fulfill(found);
//       })
//         .then(console.log);
//       fulfill(found);
//     })
//       .then((f) => {
//         exports.found = f;
//       });
//     // Promise.all(found)
//       // .then(fulfill(found));
//   })
//     .then(() => {
//       console.log("Executing the last block now.");
//       console.log(found);
//       return new Promise((fulfill, reject) => {
//         // Then tableify it.
//         var display = tableify({data: found});
//         fulfill(display);
//       });
//     })
//     .then((display) => {
//       exports.displayData = display;
//       document.getElementById("data-display").innerHTML = display;
//     });
// };
