var glob = require('glob');
var jsonfile = require('jsonfile');
// var json2csv = require('json2csv');
var jsonexport = require('jsonexport');
var remote = require('electron').remote;
var fs = require('fs');
var arrMember = require('array-member');
// var dialog = remote.require('dialog');

var exports = module.exports = {};
exports.data = [];

exports.dataHTML = `
    <table>
    <th><h2>Data</h2></th>
    <tr><td><button class="btn btn-large btn-positive" onclick=data.combineData(data.viewData())>View data...</button></td>
    <td><button class="btn btn-large btn-positive" onclick=data.combineData(data.toCSV())>Export data...</button></td></tr>
    </table>`;

exports.combineData = function(callback) {
    var myPath = config.saveDir;
    console.log(myPath);
    glob(`${myPath}/data-*.json`, (err, files) => {
        if (err) {
            console.log(err.stack);
        }
        var entryAdded = new Event('added');
        document.addEventListener('added', () => {
            if (exports.data.length == files.length) {
                callback(); // CALLBACK IS HERE
                document.removeEventListener(Event, 'added');
                exports.data = [];
            } else {
                // console.log(`exports.data.length = ${exports.data.length}. files.length = ${files.length}. Moving on.`);
            }
        }, false);
        for (let i = 0; i < files.length; i++) {
            // console.log(typeof files);
            jsonfile.readFile(files[i], (err, obj) => {
                if (err) console.log(err.stack);
                // exports.data.push(JSON.stringify(obj));
                exports.data.push(obj);
                document.dispatchEvent(entryAdded);
            });
        }
    });
};

exports.viewData = function() {
    // exports.combineData( () => {
    document.getElementById("pane").innerHTML += `
        <div id="view-data">${JSON.stringify(exports.data)}</div>`;
    // });
};

exports.toCSV = function() {
    // exports.combineData( () => {
    // var myfields = [];
    // for (let i = 0; i < exports.data.length; i++) {
    //     var mykeys = Object.keys(exports.data[i]);
    //     for (let j = 0; j < mykeys.length; j++) {
    //         if (!arrMember.member(mykeys[j], myfields)) {
    //             myfields.push(mykeys[j]);
    //         }
    //     }
    // }
    // json2csv({data: exports.data, fields: myfields}, (err, csvString) => {
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
    // });
    // });
};
