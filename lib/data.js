var glob = require('glob');
var jsonfile = require('jsonfile');
var jsonexport = require('jsonexport');
var remote = require('electron').remote;
var fs = require('fs');
var arrMember = require('array-member');

var exports = module.exports = {};
exports.data = [];

exports.dataHTML = `
    <table>
    <th><h2>Data</h2></th>
    <tr><td><button class="btn btn-large btn-positive" onclick=data.combineData(data.viewData())>View data</button></td>
    <td><button class="btn btn-large btn-positive" onclick=data.combineData(data.toCSV())>Export data...</button></td></tr>
    </table>`;

exports.combineData = function(myCallback) {  // function(action) {
    var count = 0;
    while (count < 2) {
        try {
            var myPath = config.saveDir;
            // console.log(myPath);
            glob(`${myPath}/data-*.json`, (err, files) => {
                if (err) {
                    console.log(err.stack);
                }
                var entryAdded = new Event('added');
                document.addEventListener('added', () => {
                    if (exports.data.length == files.length) {
                        // This leads to the earlier problem where it works the first
                        // time, and then continues to do that action regardless of
                        // which button is pressed.
                        // switch (action) {
                        //     case "view":
                        //         exports.viewData();
                        //         break;
                        //     case "export":
                        //         exports.toCSV();
                        //         break;
                        //     default:
                        //         console.log("Unrecognized action.");
                        // }
                        myCallback(); // CALLBACK IS HERE
                        document.removeEventListener(Event, 'added');
                        exports.data = [];
                    } else {
                        // console.log(`exports.data.length = ${exports.data.length}. files.length = ${files.length}. Moving on.`);
                    }
                }, false);
                for (let i = 0; i < files.length; i++) {
                    jsonfile.readFile(files[i], (err, obj) => {
                        if (err) console.log(err.stack);
                        exports.data.push(obj);
                        document.dispatchEvent(entryAdded);
                    });
                }
            });
            break;
        } catch(err) {
            console.log(err);
            count++;
        // } finally {
            // console.log("Couldn't do the callback.");
        }
    }
};

exports.viewData = function() {
    document.getElementById("pane").innerHTML += `
        <div id="view-data">${JSON.stringify(exports.data)}</div>`;
};

exports.toCSV = function() {
    jsonexport(exports.data, (err, csvString) => {
        if (err) {
            console.log(err.stack);
        }
        console.log(csvString);
        var date = new Date().toLocaleDateString().replace(/\//g,'-');
        remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
            title: `Save as...`,
            defaultPath: require('path').join(config.saveDir, "..", `lifetracker_data_${date}.csv`),
            filters: [
                {name: ".CSV files", extensions: ['csv']},
                {name: "All files", extensions: ['*']}
            ]
        }, (filename) => {
            fs.writeFile(filename, csvString, (err) => {
                if (err) {
                    console.log(err.stack);
                }
                console.log(`Data saved to ${filename}.`);
            });
        });
    });
};
