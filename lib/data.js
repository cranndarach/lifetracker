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

