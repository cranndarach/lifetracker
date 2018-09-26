var exports = module.exports = {};

exports.submit = function() {
  // updateMessage("hide");
  let entry = concatEntry();
  console.log(entry);
  // dataProc.data.push(data);
  dataProc.data[entry.uuid] = entry;
  dataProc.makeKeys();
  let outpath = path.join(config.config.saveDir, `data-${entry.uuid}.json`);
  return saveEntry(entry, outpath);
};

function saveMainDataFile() {
  let allDataPath = path.join(config.config.saveDir, "all-data.json");
  saveJSON(allDataPath, dataProc.entries, "Saved main data file.");
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

function updateMessage(entry) {
  let time = moment().format("LT");
  let $message = $("#message");
  let $editBtn = $("<button />", {
    id: "edit-btn",
    class: "btn-flat btn-small btn-no-accent",
    text: "Edit entry",
    click: () => {
      console.log(entry);
      edit.edit(entry);
    }
  });
  $editBtn.prepend('<i class="material-icons">edit</i>');
  $message.text(`Saved entry at ${time}!`)
    .append("&ensp;")
    .append($editBtn);
  let $tgt = $("#form-body");
  let selector = ".form-control";
  $tgt.on("change", selector, (e) => {
    populate.clearMessage($tgt, selector, e);
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
      return updateMessage(entry);
    });
}
