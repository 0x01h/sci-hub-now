// Old and less strict DOI regex.
// const doiRegex = "10.\\d{4,9}/[-._;()/:a-z0-9A-Z]+";
const doiRegex = new RegExp(
  /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\'<>])\S)+)\b/
);

var sciHubUrl;
const trueRed = "#BC243C";
var openInNewTab = false;
var autoCheckServer = true;
const defaults = {
  "scihub-url": "https://sci-hub.st/",
  "open-in-new-tab": false,
  "autocheck-server": true
};

function resetBadgeText() {
  browser.browserAction.setBadgeText({ text: "" });
}

function setthing(name, value) {
  switch(name) {
    case "scihub-url":
      sciHubUrl = value;
      break;
    case "open-in-new-tab":
      openInNewTab = value;
      break;
    case "autocheck-server":
      autoCheckServer = value;
      break;
  }
}
function initialize(name) {
  chrome.storage.local.get([name], function(result) {
    if (!(name in result)) {
      result[name] = defaults[name];
      chrome.storage.local.set(result, function () {});
    }
    setthing(name, result[name]);
  })
}
function checkServerStatus() {
  var img = document.body.appendChild(document.createElement("img"));
  img.height = 0;
  img.visibility = "hidden";
  img.onerror = function () {
    if (confirm("Looks like "+sciHubUrl+" is dead.  Would you like to go to the options page to select a different mirror?")) {
      browser.tabs.create({url: 'chrome://extensions/?options=' + chrome.runtime.id}).then();
    }
  }
  img.src = sciHubUrl + "/misc/img/raven_1.png";
}

function getHtml(htmlSource) {
  htmlSource = htmlSource[0];
  foundRegex = htmlSource.match(doiRegex);
  if (foundRegex) {
    foundRegex = foundRegex[0].split(";")[0];
    // console.log("Regex: " + foundRegex);
    if (openInNewTab) {
      var creatingTab = browser.tabs.create({
        url: sciHubUrl + foundRegex,
      });
      creatingTab.then();
    } else {
      browser.tabs.update(undefined, {url: sciHubUrl + foundRegex});
    }
    if (autoCheckServer) {
      checkServerStatus();
    }
  } else {
    browser.browserAction.setBadgeTextColor({ color: "white" });
    browser.browserAction.setBadgeBackgroundColor({ color: trueRed });
    browser.browserAction.setBadgeText({ text: ":'(" });
  }
}

function executeJs() {
  const executing = browser.tabs.executeScript({
    code: "document.body.innerHTML",
  });
  executing.then(getHtml);
}

browser.contextMenus.create({
  id: "doi-selection",
  title: "Find article by DOI!",
  contexts: ["selection"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  var creatingTab = browser.tabs.create({
    url: sciHubUrl + info.selectionText,
  });
});

browser.browserAction.onClicked.addListener(executeJs);
browser.tabs.onUpdated.addListener(resetBadgeText);
for (const property in defaults) {
  initialize(property);
}
