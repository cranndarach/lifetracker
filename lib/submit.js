var fs = require('fs');
var path = require('path');
var UUID = require('uuid-js');
// var pkg = require('../../package.json');
// var $ = window.$;

var exports = module.exports = {};
exports.submit = function() {
    let items = document.querySelectorAll("input,textarea");
    console.log(items);
    let data = {};
    let uuid = UUID.create().toString();
    data.uuid = uuid;
    for(let i = 0; i < items.length; i++) {
        data[items[i].name] = items[i].value;
    }
    console.log(data);
    data = JSON.stringify(data);
    let outpath = path.join(__dirname, "..", "data", `data-${uuid}.json`);
    // let outpath = `${pkg.savedir}/data-${uuid}.json`;
    fs.writeFile(outpath, data, function callback(err) {
        if (err) {
            fs.mkdir(path.join(__dirname, "..", "data"));
            fs.writeFile(outpath, data, (err) => {
                if (err) {
                    console.log(err.stack);
                    console.log("Could not save data.");
                } else {
                    document.getElementById("submit-message").style = "visibility: visible";
                    console.log(`Saved ${data} to ${outpath}!`);
                }
            });
            // return;
        } else {
            document.getElementById("submit-message").style = "visibility: visible";
            console.log(`Saved ${data} to ${outpath}!`);
        }
    });
    // Neaten up the above stuff too.
    let mainDataPath = path.join(config.data.saveDir, "main-data.json")
    let mainData = getMainData();
    utils.saveJSON(mainDataPath, mainData, "Saved main data!");
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
