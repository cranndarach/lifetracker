var config = module.exports = {
    saveDir: require('path').join(__dirname, "..", "data"),
    theme: "dark",
    width: 950,
    height: 750
};
var jsonfile = require('jsonfile');

config.updateConfig = function(callback) {
    jsonfile.readFile(__dirname + '/config.user.json', (err, usrConf) => {
        if (err) {
            usrConf = "No user config file found.";
        } else {
            for (let i = 0; i < Object.keys(usrConf).length; i++) {
                let key = Object.keys(usrConf)[i];
                config[key] = usrConf[key];
            }
        }
        callback(config, usrConf);
    });
};
config.updateConfig( (data, userData) => {
    console.log(`data: ${JSON.stringify(data)}`);
    console.log(`usrConf: ${JSON.stringify(userData)}`);
});
