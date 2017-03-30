var exports = module.exports = {};

exports.submit = function() {
  updateMessage("hide");
  let data = concatEntry();
  console.log(data);
  let outpath = path.join(config.data.saveDir, `data-${data.uuid}.json`);
  saveEntry(data, outpath);
  let allDataPath = path.join(config.data.saveDir, "main-data.json");
  let allData = getAllData();
  saveJSON(allDataPath + ".bak", allData, "Backed up main data file.");
  allData.push(data);
  saveJSON(allDataPath, allData, "Saved main data file.");
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

function updateMessage(vis) {
  document.getElementById("submit-message").class = vis;
}

function getAllData() {
  let allDataPath = path.join(config.data.saveDir, "all-data.json");
  jsonfile.readFile(allDataPath, (err, fromFile) => {
    if (err) {
      console.log("Main data file not found.");
      return [];
    } else {
      return fromFile;
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
          updateMessage("show");
          console.log(`Saved ${entry} to ${path}!`);
        }
      });
    } else {
      updateMessage("show");
      console.log(`Saved ${entry} to ${path}!`);
    }
  });
}
