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
  // So first set the class to "hide" to trigger the first animation
  new Promise.resolve(message.class = "hide")
    // Once it's triggered, wait for it to finish, with a cushion.
    .delay(450)
    // Then set the class to "hidden" to finalize the invisibility.
    .then(() => {
      // return new Promise.resolve(message.class = "hidden");
      message.class = "hidden";
      return;
    })
    // Wait a brief moment.
    .delay(100)
    .then(() => {
      message.innerHTML = "...";
      return;
    })
    .delay(250)
    // Fill the space with the message, still hidden.
    .then(() => {
      /* return new Promise.resolve( */
      message.innerHTML = `Saved entry at ${time}!`;
      return;
    })
    // Set the class to "show" to trigger the fade-in animation.
    .then(() => {
      // return new Promise.resolve(
      message.class = "show";
      return;
    })
    .delay(900)
    // And then set the class to "shown" to lock it in place.
    .then(() => {
      message.class = "shown";
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
