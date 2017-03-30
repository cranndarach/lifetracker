var fs = require('fs');
var path = require('path');
var UUID = require('uuid-js');

var exports = module.exports = {};

exports.submit = function() {
  updateMessage("hide");
  let data = concatEntry();
  console.log(data);
  data = JSON.stringify(data);
  let outpath = path.join(config.data.saveDir, `data-${data.uuid}.json`);
  // let outpath = `${pkg.savedir}/data-${uuid}.json`;
  fs.writeFile(outpath, data, (e) => {
    if (e) {
      fs.mkdir(path.join(config.data.saveDir));
      fs.writeFile(outpath, data, (err) => {
        if (err) {
          console.log(err.stack);
          console.log("Could not save data.");
        } else {
          updateMessage("show");
          // document.getElementById("submit-message").style = "visibility: visible";
          console.log(`Saved ${data} to ${outpath}!`);
        }
      });
      // return;
    } else {
      updateMessage("show");
      // document.getElementById("submit-message").style = "visibility: visible";
      console.log(`Saved ${data} to ${outpath}!`);
    }
  });
  // Neaten up the above stuff too.
  let mainDataPath = path.join(config.data.saveDir, "main-data.json");
  let mainData = getMainData();
  saveJSON(mainDataPath, mainData, "Saved main data!");
};

function saveJSON(path, data, message) {
  jsonfile.writeFile(path, data, (err) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log(message);
    }
  });
  // return;
}

function updateMessage(vis) {
  document.getElementById("submit-message").class = vis;
}

function getMainData() {
  let mainDataPath = path.join(config.data.saveDir, "main-data.json");
  jsonfile.readFile(mainDataPath, (err, fromFile) => {
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
