var glob = require('glob');
var jsonfile = require('jsonfile');

var exports = module.exports = {};
exports.data = [];

exports.dataHTML = `
    <table>
    <th><h2>Data</h2></th>
    <tr><td><button class="btn btn-large btn-positive" onclick=data.viewData()>View data...</button></td>
    <td><button class="btn btn-large btn-positive">Export data...</button></td></tr>
    </table>`;

exports.combineData = function(callback) {
    let myPath = config.saveDir;
    console.log(myPath);
    glob(`${myPath}/data-*.json`, (err, files) => {
        if (err) {
            console.log(err.stack);
        }
        for (let i = 0; i <= files.length; i++) {
            if (i == files.length) {
                console.log('Callback time');
                callback();
            } else {
                console.log(files[i]);
                jsonfile.readFile(files[i], (err, obj) => {
                    if (err) console.log(err.stack);
                    console.log(obj);
                    exports.data.push(obj);
                    console.log(exports.data);
                });
            }
        }
    });
};

exports.viewData = function() {
    exports.combineData( () => {
        document.getElementById("pane").innerHTML += `
            <div id="view-data">${exports.data}</div>`;
    });
};
