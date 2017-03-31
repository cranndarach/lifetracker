var exports = module.exports = {};

exports.data = [];

exports.dataHTML = `
    <div id="data-space">
        ${exports.searchHTML}
    </div>
    <table>
    <th><h2>Data</h2></th>
    <tr><td><button class="btn btn-large btn-positive"\
        onclick=dataProc.toCSV()>Export data...</button>
    </td></tr>
    </table>`;

exports.searchHTML = `<div id="access-data" class="form">
    <div class="form-group">
        <fieldset id="filter">
            <legend>Filter data:</legend>
            ${exports.queryRow}
        </fieldset>
    </div>
    <button class="btn btn-form btn-default" onclick="dataProc.addRow()">\
        Add row</button>
    <button class="btn btn-form btn-default" onclick="dataProc.search()">Search\
        </button>
    <!--button class="btn btn-form btn-default"\
        onclick="dataProc.combineData(dataProc.addRow())">Add row</button>
    <button class="btn btn-form btn-default"\
        onclick="dataProc.combineData(dataProc.search())">Search</button-->
  </div>`;

exports.queryRow = `
    <div class="query">
        <label>In which fields?</label>
        <select multiple>
            ${exports.fieldSelect}
        </select>
        <input class="form-control" name="query" type="text" />
    </div>`;


exports.addRow = function() {
    document.getElementById("query").innerHTML += exports.queryRow;
};

exports.search = function() {
    // var group = document.getElementById("query");
    var criteria = document.getElementsByClassName("query");
    var found = [];
    criteria.forEach((set) => {
        // var fields = set.getElementsByTagName("select").selected.value;
        var find = set.getElementsByTagName("input")[0].value;
        exports.data.forEach((d) => {
            if (arrMember.objectValue(find, d)) {
                found.push(d);
            }
        });
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
            defaultPath: require('path').join(config.saveDir, "..",
                                              `lifetracker_data_${date}.csv`),
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
                        exports.fieldSelect = [];
                        exports.fields = [];
                        exports.data.forEach((obj) => {
                            Object.keys(obj).forEach((key) => {
                                if (!arrMember.member(key, exports.fields)) {
                                    exports.fields.push(key);
                                    exports.fieldSelect.push(`
                                    <option value="${key}">${key}</option>`);
                                }
                            });
                        });
                        // exports.fieldSelect becomes a string here:
                        exports.fieldSelect = exports.fieldSelect.sort().join('');
                        myCallback(); // CALLBACK IS HERE
                        document.removeEventListener(Event, 'added');
                        exports.data = [];
                    } else {
                        // console.log(`exports.data.length = 
                        // ${exports.data.length},
                        // files.length = ${files.length}. Moving on.`);
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
        } catch(e) {
            console.log(e);
            count++;
        }
    }
};
