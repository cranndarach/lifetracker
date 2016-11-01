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
        var entryAdded = new Event('added');
        document.addEventListener('added', () => {
            if (exports.data.length == files.length) {
                callback();
                document.removeEventListener(Event, 'added');
            } else {
                console.log(`exports.data.length = ${exports.data.length}. files.length = ${files.length}. Moving on.`);
            }
        }, false);
        for (let i = 0; i <= files.length; i++) {
            jsonfile.readFile(files[i], (err, obj) => {
                if (err) console.log(err.stack);
                exports.data.push(obj);
                document.dispatchEvent(entryAdded);
            });
        }
    });
};

exports.viewData = function() {
    exports.combineData( () => {
        document.getElementById("pane").innerHTML += `
            <div id="view-data">${JSON.stringify(exports.data)}</div>`;
    });
};
