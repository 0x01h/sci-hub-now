'use strict';

function getUrl(field) {
  chrome.storage.local.get(['scihub-url'], function (result) {
    field.value = result['scihub-url'];
  })
}

function setUrl(url) {
  chrome.storage.local.set({'scihub-url': url}, function () {})
  var bgPage = chrome.extension.getBackgroundPage();
  bgPage.setUrl(url);
}

var urlField = document.getElementById("url");
getUrl(urlField);
urlField.onkeyup = function () {
  setUrl(urlField.value);
};
