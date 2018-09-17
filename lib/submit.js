var exports = module.exports = {};
// var writeJSON = Promise.promisify(jsonfile.writeFile);

exports.submit = function() {
  updateMessage("hide");
  let data = concatEntry();
  console.log(data);
  dataProc.data.push(data);
  dataProc.makeKeys();
  let outpath = path.join(config.config.saveDir, `data-${data.uuid}.json`);
  return saveEntry(data, outpath);
};

function saveMainDataFile() {
  let allDataPath = path.join(config.config.saveDir, "all-data.json");
  // return fs.copyFileAsync(allDataPath, allDataPath + ".bak")
  //   .catch((err) => {
  //     if (err.code === "ENOENT") {
  //       console.log("No existing data file found. Starting a new one.");
  //       return new Promise.resolve();
  //     } else {
  //       throw err;
  //     }
  //   })
  //   .then(() => {
      // Synchronous(? Whichever one isn't awaited.)
  saveJSON(allDataPath, dataProc.data, "Saved main data file.");
    // })
    // .catch((err) => {
    //   console.log(err.stack);
    //   console.log("Could not completely save entry. See stack.");
    // });
}

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
  // let time = new Date().toLocaleTimeString();
  let time = moment().format("LT");
  let $message = $("#message");
  return new Promise.resolve($message.html(""))
    .delay(50)
    .then(() => {
      // return new Promise.resolve($message.text(`Saved entry at ${time}!`));
      $message.text(`Saved entry at ${time}!`);
      let $tgt = $("#form-body");
      let selector = ".form-control";
      $tgt.on("change", selector, (e) => {
        populate.clearMessage($tgt, selector, e);
      });
    });
}

function concatEntry() {
  let $fields = $("#form-body input, #form-body textarea");
  let serialized = $fields.serializeArray();
  let data = _.transform(serialized, (accumulator, itm, index, input) => {
    let key = itm.name;
    let val = itm.value;
    accumulator[key] = val;
  }, {});
  data.uuid = UUID.create().toString().slice(0, 8);
  return data;
}

function saveEntry(entry, path) {
  let $message = $("#submit-message");
  new Promise.delay(100).then(() => {
    return new Promise.resolve($message.html(""));
  })
    .then(() => {
      return new Promise.resolve($message.html("..."));
    })
    .then(() => {
      return jsonfile.writeFileAsync(path, entry);
    })
    .catch((err) => {
      return fs.mkdirAsync((path.join(config.config.saveDir)))
        .then(() => {
          return jsonfile.writeFileAsync(path, entry);
        });
    })
    .then(() => {
      return saveMainDataFile();
    })
    .delay(250)
    .then(() => {
      return updateMessage();
    });
}
