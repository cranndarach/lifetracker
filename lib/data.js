var exports = module.exports = {
  get entries() {
    return _.values(this.data);
  }
};

function backupData() {
  let allDataPath = path.join(config.config.saveDir, "all-data.json");
  return fs.copyFileAsync(allDataPath, allDataPath + ".bak");
}

function mergeData() {
  let dataPattern = path.join(config.config.saveDir, "data-*.json");
  return glob.globAsync(dataPattern)
    .each((fileName) => {
      return jsonfile.readFileAsync(fileName)
        .then((entry) => {
          // exports.data.push(reformatDates(entry));
          exports.data[entry.uuid] = reformatDates(entry);
        });
    });
}

function reformatDates(entry) {
  if (entry.timeFormat && (entry.timeFormat != config.config.timeFormat)) {
    entry.time = moment(entry.time, entry.timeFormat).format(config.config.timeFormat);
    entry.timeFormat = config.config.timeFormat;
  }
  if (entry.dateFormat && (entry.dateFormat != config.config.dateFormat)) {
    entry.date = moment(entry.date, entry.dateFormat).format(config.config.dateFormat);
    entry.dateFormat = config.config.dateFormat;
  }
  return entry;
}

exports.loadData = function() {
  // exports.data = [];
  exports.data = {};
  return backupData()
    .catch((err) => {
      if (err.code === "ENOENT") {
        console.log("No existing data file found. Starting a new one.");
        return new Promise.resolve();
      } else {
        throw err;
      }
    })
    .then(() => {
      return mergeData();
    });
};

exports.getCategories = function() {
  exports.categories = exports.categories ? exports.categories : [];
  return Promise.all(Promise.each(exports.entries, (entry) => {
    let cat = entry.category;
    exports.updateCategories(cat);
  }))
    .catch((err) => {
      console.log(err.stack);
    });
};

exports.updateCategories = function(cat) {
  if (cat && !_.includes(exports.categories, cat)) {
    exports.categories.push(cat);
    exports.categoryObj = _.zipObject(exports.categories);
  }
};

exports.makeKeys = function() {
  // Get the set of unique keys from the data.
  let dataKeys = _.uniq(_.flatten(_.map(exports.entries, _.keys)));
  exports.keys = _.union(config.config.dataColumnOrder, dataKeys);
};

exports.confirmDelete = function(entryId) {
  let $modal = $("<div />", {
    class: "modal",
    id: "confirm-delete-" + entryId
  });
  let $modalContent = $("<div />", {
    class: "modal-content",
    text: "Delete entry? This cannot be undone."
  });
  let $modalFooter = $("<div />", {
    class: "modal-footer"
  });
  let $deleteBtn = $("<button />", {
    class: "btn-alert btn-flat",
    text: "Delete"
  });
  let $cancelBtn = $("<button />", {
    class: "btn-flat modal-close",
    text: "Cancel"
  });
  $modalFooter.append($cancelBtn)
    .append($deleteBtn);
  $modal.append($modalContent)
    .append($modalFooter);
  $("#content").append($modal)
    .ready(() => {
      let modal = M.Modal.init($modal, {
        preventScrolling: false,
        onOpenStart: function() {
          $deleteBtn.click(() => {
            this.close();
            return deleteEntry(entryId)
              .then(() => {
                let dyn = $("#data-table").data("dynatable");
                dyn.settings.dataset.originalRecords = explore.getRecords();
                dyn.process();
                showDeletedMessage(entryId);
              })
              .catch((err) => {
                console.log(err);
                let message = "Error deleting entry: ";
                if (err.code === "ENOENT") {
                  message += "File not found.";
                } else {
                  message += "See console for details.";
                }
                simpleToast(message, entryId);
              });
          });
        },
        onCloseEnd: function () {
          this.destroy();
        }
      });
      // modal.open();
      $modal.modal("open");
    });
};

function deleteEntry(entryId) {
  delete exports.data[entryId];
  let entryPath = path.join(config.config.saveDir, `data-${entryId}.json`);
  return fs.unlinkAsync(entryPath);
}

function simpleToast(message, entryId) {
  let $dismissBtn = $("<button />", {
    id: "dismiss-btn",
    class: "btn-flat toast-action btn-neutral",
    text: "Dismiss"
  });
  $dismissBtn.prepend('<i class="material-icons tiny">done</i>');
  let toast = M.toast({
    html: `<span id=toast-${entryId}>${message}</span>`,
    displayLength: 30000
  });
  $dismissBtn.click(() => {
    toast.dismiss();
  });
  toast.$el.append($dismissBtn);
}

function showDeletedMessage(entryId) {
  let time = moment().format("LT");
  simpleToast(`Entry deleted at ${time}.`, entryId);
}
