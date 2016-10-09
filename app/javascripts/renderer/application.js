var path = require('path');
var jsonfile = require('jsonfile');

require('electron').ipcRenderer.on('loaded', function(event, data) {
    populate("home");
});
