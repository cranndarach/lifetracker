!function () {
"use strict";

// Workaround for "datalist" popup for "input" element in Electron
// - unsolved issue: https://github.com/electron/electron/issues/360

// [usage]
// - A. <script src="./inputlistpopup.js" defer></script> in html
// - B. webContents.executeJavaScript(`require("./inputlistpopup")`) in main.js
// see complete example at:
//    https://gist.github.com/bellbind/0bc2bb6fd3392f93529504879d335fc9

function popupListener(ev) {
    const {Menu, getCurrentWindow} = require("electron").remote;
    const {left, bottom, width, height} = ev.target.getBoundingClientRect();
    const listId = ev.target.getAttribute("list");
    // popup only in input's right square
    if (!listId || ev.offsetX < width - height) return;
    const css3escaped = Array.from(
        listId, ch => `\\${ch.codePointAt(0).toString(16)}`).join("");
    const query = `datalist#${css3escaped} > option[value]`;
    const template = Array.from(document.querySelectorAll(query), opt => ({
        label: opt.value,
        click() {ev.target.value = opt.value;},
    }));
    const menu = Menu.buildFromTemplate(template);
    //NOTE: popup position must cast to integer (client rect is float)
    menu.popup(getCurrentWindow(), {x: left|0, y: bottom|0, async: true});
    ev.preventDefault();
}

// inject existing inputs
Array.from(document.querySelectorAll("input")).forEach(input => {
    input.addEventListener("click", popupListener, false);
});

// future inputs by using mutation observer
new MutationObserver(mutations => mutations.forEach(m => {
    if (m.type !== "childList") return;
    Array.from(m.addedNodes).forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.tagName === "INPUT") {
            node.addEventListener("click", popupListener, false);
        } else {
            Array.from(node.querySelectorAll("input")).forEach(input => {
                input.addEventListener("click", popupListener, false);
            });
        }
    });
    Array.from(m.removedNodes).forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.tagName === "INPUT") {
            node.removeEventListener("click", popupListener, false);
        } else {
            Array.from(node.querySelectorAll("input")).forEach(input => {
                input.removeEventListener("click", popupListener, false);
            });            
        }
    });
})).observe(document.body, {childList: true, subtree: true});
}();
