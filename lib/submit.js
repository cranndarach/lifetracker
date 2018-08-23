var exports = module.exports = {};

var writeJSON = Promise.promisify(jsonfile.writeFile);

exports.submit = function() {
  updateMessage("hide");
  let data = concatEntry();
  console.log(data);
  dataProc.data.push(data);
  dataProc.makeKeys();
  let outpath = path.join(config.config.saveDir, `data-${data.uuid}.json`);
  saveEntry(data, outpath);
  let allDataPath = path.join(config.config.saveDir, "all-data.json");
  getAllData(allDataPath, (allData) => {
    // console.log(JSON.stringify(allData));
    // saveJSON(allDataPath + ".bak", allData, "Backed up main data file.");
    jsonfile.writeFile(allDataPath + ".bak", allData, (err) => {
      if (err) {
        console.log(err.stack);
      } else {
        allData.push(data);
        saveJSON(allDataPath, allData, "Saved main data file.");
      }
    });
  });
};

function saveJSON(path, data, message) {
  jsonfile.writeFile(path, data, (err) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log(message);
    }
  });
}

function updateMessage() {
  let time = new Date().toLocaleTimeString();
  // let message = document.getElementById("submit-message");
  let $message = $("#submit-message");
  // So first set the class to "hide" to trigger the first animation
  // return new Promise.resolve(message.class = "hidden")
  return new Promise.resolve($message.html(""))
    .delay(50)
    .then(() => {
      return new Promise.resolve($message.text(`Saved entry at ${time}!`));
    // })
    // .then(() => {
    //   return new Promise.resolve(message.class = "shown");
    });
}

function getAllData(dataPath, callback) {
  // let allDataPath = path.join(confg.data.saveDir, "all-data.json");
  jsonfile.readFile(dataPath, (err, fromFile) => {
    if (err) {
      console.log("Main data file not found.");
      callback([]);
    } else {
      callback(fromFile);
    }
  });
}

function concatEntry() {
  // let items = document.querySelectorAll("input,textarea");
  let $fields = $("input, textarea");
  let serialized = $fields.serializeArray();
  console.log(serialized);
  let data = _.transform(serialized, (accumulator, itm, index, input) => {
    let key = itm.name;
    let val = itm.value;
    accumulator[key] = val;
  }, {});
  console.log(data);
  // console.log(items);
  // let data = {};
  // The first 8 digits still have 4.3*10^9 possible combos.
  data.uuid = UUID.create().toString().slice(0, 8);
  // for(let i = 0; i < items.length; i++) {
  //     data[items[i].name] = items[i].value;
  // }
  return data;
}

function saveEntry(entry, path) {
  // let message = document.getElementById("submit-message");
  let $message = $("#submit-message");
  // So first set the class to "hide" to trigger the first animation
  new Promise.delay(100).then(() => {
    // return new Promise.resolve(message.class = "hidden");
    // return new Promise.resolve(message.innerHTML = "");
    return new Promise.resolve($message.html(""));
  })
    // .delay(100)
    .then(() => {
      // return new Promise.resolve(message.innerHTML = "...");
      return new Promise.resolve($message.html("..."));
      // return;
    })
    .then(() => {
      return writeJSON(path, entry);
    })
    .catch((err) => {
      fs.mkdir((path.join(config.config.saveDir)));
      return writeJSON(path, entry);
    })
    .delay(250)
    .then(() => {
      return updateMessage();
    })
    .then(console.log(`Saved ${JSON.stringify(entry)} to ${path}!`))
    .catch((err) => {
      console.log(err.stack);
      console.log("Could not save entry.");
    });
}
