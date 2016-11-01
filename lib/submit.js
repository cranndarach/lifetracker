var fs = require('fs');
var path = require('path');
var UUID = require('uuid-js');
// var pkg = require('../../package.json');
// var $ = window.$;

var submit = function() {
    let items = document.getElementsByTagName("input");
    console.log(items);
    let data = {};
    let uuid = UUID.create().toString();
    data.uuid = uuid;
    for(let i = 0; i < items.length; i++) {
        data[items[i].name] = items[i].value;
    }
    console.log(data);
    data = JSON.stringify(data);
    let outpath = path.join(__dirname, "data", `data-${uuid}.json`);
    // let outpath = `${pkg.savedir}/data-${uuid}.json`;
    fs.writeFile(outpath, data, function callback(err) {
        if (err) {
            fs.mkdir(path.join(__dirname, "data"));
            fs.writeFile(outpath, data, (err) => {
                if (err) {
                    console.log(err.stack);
                    console.log("Could not save data.");
                } else {
                    document.getElementById("submit-message").style = "visibility: visible";
                    console.log(`Saved ${data} to ${outpath}!`);
                }
            });
            // return;
        } else {
            document.getElementById("submit-message").style = "visibility: visible";
            console.log(`Saved ${data} to ${outpath}!`);
        }
    });
}
