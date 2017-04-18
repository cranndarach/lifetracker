var exports = module.exports = {};

var writeJSON = Promise.promisify(jsonfile.writeFile);

exports.submit = function() {
  updateMessage("hide");
  let data = concatEntry();
  console.log(data);
  let outpath = path.join(config.data.saveDir, `data-${data.uuid}.json`);
  saveEntry(data, outpath);
  let allDataPath = path.join(config.data.saveDir, "all-data.json");
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
  let message = document.getElementById("submit-message");
  // So first set the class to "hide" to trigger the first animation
  // return new Promise.resolve(message.class = "hidden")
  return new Promise.resolve(message.innerHTML = "")
    .delay(50)
    .then(() => {
      return new Promise.resolve(message.innerHTML = `Saved entry at ${time}!`);
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
  let items = document.querySelectorAll("input,textarea");
  console.log(items);
  let data = {};
  let uuid = UUID.create().toString();
  data.uuid = uuid;
  for(let i = 0; i < items.length; i++) {
      data[items[i].name] = items[i].value;
  }
  return data;
}

function saveEntry(entry, path) {
  let message = document.getElementById("submit-message");
  // So first set the class to "hide" to trigger the first animation
  new Promise.delay(100).then(() => {
    // return new Promise.resolve(message.class = "hidden");
    return new Promise.resolve(message.innerHTML = "");
  })
    // .delay(100)
    .then(() => {
      return new Promise.resolve(message.innerHTML = "...");
      // return;
    })
    .then(() => {
      return writeJSON(path, entry);
    })
    .catch((err) => {
      fs.mkdir((path.join(config.data.saveDir)));
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
