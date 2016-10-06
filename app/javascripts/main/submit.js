// probably use jquery
// ~"on #form submit"~: form.serialize
// access the file system
// save it
// return a successful signal

var fs = require('fs');
var UUID = require('uuid-js');
var pkg = require('../../package.json');
// var $ = window.$;

var submit = function() {
    let items = document.getElementsByTagName("input");
// $("form").submit( () => {
    // let fd = $(this).serializeArray();
    // let fd = $(id).serializeArray();
    let data = {};
    let uuid = UUID.create().toString();
    data.uuid = uuid;
    for(let i = 0; i < items.length; i++) {
        data[items[i].name] = items[i].value;
    }
    // jQuery.each(fd, (i, fd) => { data[fd.name] = fd.value });
    console.log(data);
    // let outpath = path.join(__dirname, pkg.settings.savedir, `${uuid}.json`);
    // let outpath = `${pkg.savedir}/data-${uuid}.json`;
    // let dfile = fs.createWriteStream(outpath);
    // fs.writeFile(outpath, data, function callback(err) {
    //     if (err) {
    //         // if (err.code === 'ENOENT') {
    //         fs.mkdir(path.join(__dirname, pkg.settings.savedir));
    //         console.log("Try again.");
    //         return;
            //     fs.writeFile(outpath, data, function callback(err) {
            //         if(err) {
            //             throw err;
            //         } else {
            //             $("#submit-message").css("color", "red");
            //             console.log(`Saved ${data} to ${outpath}!`);
            //         }
            //     });
            // } else {
            //     throw err;
            // }
        // } else {
        //     $("#submit-message").css("color", "red");
        //     console.log(`Saved ${data} to ${outpath}!`);
        // }
    // });
}
