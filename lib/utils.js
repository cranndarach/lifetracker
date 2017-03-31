// var jsonfile = require('jsonfile');

try {
  var exports = module.exports = {};
  exports.saveJSON = function(path, data, message) {
    jsonfile.writeFile(path, data, (err) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(message);
      }
    });
    // return;
  };
  console.log("All quiet on the utils front.");
} catch(e) {
  console.log(e.stack);
}
