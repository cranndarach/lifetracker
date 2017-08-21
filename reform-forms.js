#!/usr/bin/env node

const CSON = require("cson");
const Promise = require("bluebird");
const writeFile = Promise.promisify(require("fs").writeFile);

var newForms = {
  main: {},
  status: {},
  influences: {}
};
// var main = [];
// var status = [];
// var influences = [];

new Promise((resolve, reject) => {
  return CSON.load(__dirname + "/lib/forms.cson", (err, forms) => {
    if (err) {
      reject(err);
    } else {
      resolve(forms);
    }
  });
})
  .then((forms) => {
    return Promise.all(Promise.each(Object.keys(forms), (key) => {
      let form = forms[key];
      // console.log(form);
      let page = form.page;
      // console.log(page);
      delete form.page;
      // newForms[page].push(form);
      // console.log(form);
      newForms[page][key] = form;
    }));
  })
  .then(() => {
    console.log(newForms);
    return new Promise((resolve, reject) => {
      resolve(CSON.stringify(newForms));
      // return CSON.stringify(newForms, (csonString) => {
      //   console.log(csonString);
      //   resolve(csonString);
      // });
    });
  })
  .then((csonForms) => {
    console.log(csonForms);
    return writeFile(__dirname + "/forms.cson", csonForms);
  })
  .then(() => {
    console.log("done!");
  })
  .catch((err) => {
    console.log(err.stack);
  });
