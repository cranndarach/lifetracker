var exports = module.exports = {};

exports.presetForm = function(pageName, formName) {
  gen.makeFormHTML(pageName, formName)
    .then((form) => {
      return new Promise((resolve, reject) => {
        let content = `${form.head}
        ${form.fieldsHTML}
        ${form.foot}`;
        document.getElementById("pane").innerHTML = content;
        resolve(document.getElementsByTagName("input"));
      });
    });
};
