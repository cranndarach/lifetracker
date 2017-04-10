var exports = module.exports = {};

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
  // message.class = "hide";
  Promise.delay(350, Promise.resolve(message.class = "hide")) // () => {
    // return new Promise().resolve(message.class = "hide");
  // })
  .then(() => {
    return new Promise.resolve(message.innerHTML = `Saved entry at ${time}!`);
    // message.innerHTML = `Saved entry at ${time}!`;
    // message.class = "show";
  })
  .then(() => {
    message.class = "show";
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
  jsonfile.writeFile(path, entry, (e) => {
    if (e) {
      fs.mkdir(path.join(config.entry.saveDir));
      jsonfile.writeFile(path, entry, (err) => {
        if (err) {
          console.log(err.stack);
          console.log("Could not save entry.");
        } else {
          updateMessage();
          console.log(`Saved ${JSON.stringify(entry)} to ${path}!`);
        }
      });
    } else {
      updateMessage();
      console.log(`Saved ${JSON.stringify(entry)} to ${path}!`);
    }
  });
}
