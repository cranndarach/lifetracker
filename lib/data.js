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
      Promise.filter(exports.data, (entry) => {
        console.log(entry);
        // Tried `all` and `any`
        return Promise.all((criteria) => {
          Promise.map(criteria, (criterion) => {
            Promise.filter(Object.keys(entry), (k) => {
              // Get only the keys present in the entry.
              let presence = arrMember.member(k, criterion.fields);
              console.log(presence);
              return presence;
            })
              // .then((keys) => {
              //   return new Promise((resolve, reject) => {
              //     console.log(keys);
              //     resolve(keys);
              //   });
              // })
              .all((keys) => {
                // return Promise.all(keys.map((key) => {
                return Promise.map(keys, (key) => {
                // Get the values stored at those keys.
                  // return new Promise().resolve(entry[key]);
                  return entry[key];
                });
              })
              .then((values) => {
                // return new Promise((resolve, reject) => {
                  if (arrMember.member(criterion.find, values, kind="contains")) {
                    // If one criterion is a match, resolve.
                    console.log("Got one.");
                    return true;
                    // resolve(entry);
                  } else {
                    console.log("Not a match.");
                    return false;
                    // If not, reject that criterion.
                    // reject("Not a match.");
                    // resolve(false);
                  }
                // }); // End of returned promise
              }); // End of then((values))
            // Put a `then` here!! If there is one `true`, return `true`.
          });
        }) // End of all(criteria)
        // This part says whether to keep the entry.
        // Iterate over results, making a promise for each. If the result
        // was "true," then resolve true. As soon as one resolves, resolve
        // the block.
          .filter((results) => {
            console.log(results);
            // Return an array containing only true results.
            return results;
            // return Promise.each(results, (result) => {
            //   return new Promise((resolve, reject) => {
            //     if (result) {
            //       resolve(true);
            //     }
            //   });
            // });
          })
          .then((res) => {
            // If there was at least one true result.
            if (res.length >= 1) {
              return true;
            } else {
              return false;
            }
          });
      }) // End of filter(entries)
        // Now tableify
        .then((found) => {
          console.log("Executing the last block now.");
          console.log(found);
          exports.displayData = tableify({data: found});
          exports.found = found;
          document.getElementById("data-display").innerHTML = exports.displayData;
        }); // End of then(found)
    }); // End of then(criteria)
};


// exports.search = function() {
//   // var found = [];
//   var filter = document.getElementById("filter");
//   var criteria = filter.getElementsByTagName("fieldset");
//   Promise.map(criteria, (criterion) => {
//     return new Promise((resolve, reject) => {
//       Promise.join(getSelected(criterion), getSearchValue(criterion), (selected, find) => {
//       // return new Promise((resolve, reject) => {
//         Promise.map(exports.data, (entry) => {
//           Promise.map(selected, (field) => {
//             return new Promise((resolve, reject) => {
//               let value = entry[field];
//               
//               // if (value == null) {
//               //   value = false;
//               // }
//               resolve(value);
//             });
//           })
//             // arrMember.member searches an array, not a string. So we need
//             // to use `then` instead of `map`.
//             .then((values) => {
//               return new Promise((resolve, reject) => {
//                 // if (values) {
//                 try {
//                   console.log(values);
//                   resolve(arrMember.member(find, values, kind="contains"));
//                   console.log("Found a match.");
//                 } catch (err) {
//                   resolve(false);
//                 }
//               });
//             })
//             // Likewise, `member` returns one truth value.
//             .then((success) => {
//               return new Promise((resolve, reject) => {
//                 if (success) {
//                   if (!arrMember.member(entry, found)) {
//                     resolve(entry);
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
//         // resolve(found);
//       })
//         .then(console.log);
//       resolve(found);
//     })
//       .then((f) => {
//         exports.found = f;
//       });
//     // Promise.all(found)
//       // .then(resolve(found));
//   })
//     .then(() => {
//       console.log("Executing the last block now.");
//       console.log(found);
//       return new Promise((resolve, reject) => {
//         // Then tableify it.
//         var display = tableify({data: found});
//         resolve(display);
//       });
//     })
//     .then((display) => {
//       exports.displayData = display;
//       document.getElementById("data-display").innerHTML = display;
//     });
// };
