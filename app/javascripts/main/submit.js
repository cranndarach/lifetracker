// probably use jquery
// ~"on #form submit"~: form.serialize
// access the file system
// save it
// return a successful signal

var fs = require('fs');
var UUID = require('uuid-js');
var pkg = require('../../package.json');

// var submit = function() {
$("form").submit(data => {
    let fd = $(this).serializeArray();
    let data = {};
    let uuid = UUID.create().toString();
    data.uuid = uuid;
    $.each(fd, (i, fd) => { data[fd.name] = fd.value });
    let outpath = `${pkg.savedir}/data-${uuid}.json`;
    let dfile = fs.createWriteStream(outpath);
    dfile.open();
    dfile.write(data);
    dfile.close();
    $("#submit-message").css("display", "inline");
});
// }
