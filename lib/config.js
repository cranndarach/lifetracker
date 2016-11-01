var config = module.exports = {
    saveDir: require('path').join(__dirname, "..", "data"),
    theme: "dark",
    width: 950,
    height: 750
};
var jsonfile = require('jsonfile');
// var arrMember = require('array-member');

jsonfile.readFile(__dirname + '/config.user.json', (err, usrConf) => {
    if (err) {
        console.log("No user config file found.");
    } else {
        for (let i = 0; i < usrConf.length; i++) {
            let key = Object.keys(usrConf)[i];
            config[key] = usrConf[key];
        }
        console.log("User config file loaded.");
    }
});
