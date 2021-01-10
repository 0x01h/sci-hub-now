'use strict';

function updatePageString(field, propname) {
  chrome.storage.local.get([propname], function (result) {
    field.value = result[propname];
  })
}
function updatePageBool(field, propname) {
  chrome.storage.local.get([propname], function (result) {
    field.checked = result[propname];
  })
}
function updateStorage(val, propname) {
  var obj = {};
  obj[propname] = val;
  chrome.storage.local.set(obj, function () {});
  var bgPage = chrome.extension.getBackgroundPage();
  bgPage.setthing(propname, val);
}
function updateStuffString(field, propname) {
  updatePageString(field, propname);
  field.onkeyup = function () {
    updateStorage(field.value, propname);
  }
}
function updateStuffBool(field, propname) {
  updatePageBool(field, propname);
  field.onchange = function () {
    updateStorage(field.checked, propname);
  }
}

updateStuffString(document.getElementById("url"), "scihub-url");
updateStuffBool(document.getElementById("newtab"), "open-in-new-tab");
