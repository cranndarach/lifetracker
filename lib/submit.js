var exports = module.exports = {};

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
  saveJSON(allDataPath, dataProc.data, "Saved main data file.");
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
  let time = moment().format("LT");
  let $message = $("#message");
  return new Promise.resolve($message.html(""))
    .delay(50)
    .then(() => {
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
  data.dateFormat = config.config.dateFormat;
  data.timeFormat = config.config.timeFormat;
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
