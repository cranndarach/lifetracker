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
} catch(e) {
  console.log(e.stack);
}
