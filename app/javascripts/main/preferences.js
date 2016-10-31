// var cson = require('fs-cson');
var jsonfile = require('jsonfile');
var themes = require('../themes.js');
// var json2csv = require('json2csv');

// var themes;
// var setTheme;

// Use the path to the stylesheet as the href property in the link tag in index.html
// This function is called by ../renderer/application.js
// function setTheme(theme) {
function setTheme(theme) {
    let themePath = themes[theme];
    document.getElementById("theme").href = `stylesheets/${themePath}`;
}

//  Read the themes file to get the path to each theme's stylesheet
// jsonfile.readFile('../../themes.json', (err, themes) => {
//     console.log(__dirname);
//     if (err) console.log(err);
//
//     // Use the path to the stylesheet as the href property in the link tag in index.html
//     // This function is called by ../renderer/application.js
//     // function setTheme(theme) {
//     setTheme = function(theme) {
//         let themePath = themes[theme];
//         document.getElementById("theme").href = `stylesheets/${themePath}`;
//     }
// });
