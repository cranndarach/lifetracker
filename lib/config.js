var exports = module.exports = {};
exports.data = {
    saveDir: require('path').join(__dirname, "..", "data"),
    theme: "dark",
    width: 950,
    height: 750
};
var jsonfile = require('jsonfile');

exports.getConfig = function(callback) {
    jsonfile.readFile(__dirname + '/config.user.json', (err, usrConf) => {
        if (err) {
            usrConf = "No user config file found.";
        } else {
            for (let i = 0; i < Object.keys(usrConf).length; i++) {
                let key = Object.keys(usrConf)[i];
                exports.data[key] = usrConf[key];
            }
        }
        callback(exports.data, usrConf);
    });
};
exports.getConfig( (data, userData) => {
    console.log(`config: ${JSON.stringify(data)}`);
    console.log(`usrConf: ${JSON.stringify(userData)}`);
});
