var glob = require('glob');
var jsonfile = require('jsonfile');
var jsonexport = require('jsonexport');
var remote = require('electron').remote;
var fs = require('fs');
var arrMember = require('array-member');
var tableify = require('tableify');

var exports = module.exports = {};
exports.data = [];

exports.dataHTML = `
    <div id="data-space">
        <div id="access-data" class="form">
            <div class="form-group">
                <label>Find data containing:</label>
                <input class="form-control" id="query" name="query" type="text" />
            </div>
            <div class="form-group">
                <button class="btn btn-form btn-default" onclick="dataProc.combineData(dataProc.search())">Search</button>
            </div>
        </div>
    </div>
    <table>
    <th><h2>Data</h2></th>
    <tr><td><button class="btn btn-large btn-positive" onclick=dataProc.combineData(dataProc.toCSV())>Export data...</button></td></tr>
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

exports.search = function() {
    var query = document.getElementById("query").value;
    var found = [];
    exports.data.forEach((d) => {
        if (arrMember.objectValue(query, d)) {
            found.push(d);
        }
    });
    var display = tableify({data: found});
    document.getElementById("data-space").innerHTML += display;
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

// console.log("Loaded data.js");
