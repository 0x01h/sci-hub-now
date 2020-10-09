// Old and less strict DOI regex.
// const doiRegex = "10.\\d{4,9}/[-._;()/:a-z0-9A-Z]+";
const doiRegex = new RegExp(
  /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\'<>])\S)+)\b/
);

var sciHubUrl;
const trueRed = "#BC243C";

function resetBadgeText() {
  browser.browserAction.setBadgeText({ text: "" });
}

function setUrl(url) {
  sciHubUrl = url;
};
function iniitalizeUrl () {
  chrome.storage.local.get(["scihub-url"], function (result) {
    if (!("scihub-url" in result)) {
      result["scihub-url"] = "https://sci-hub.st/";
      chrome.storage.local.set(result, function () {});
    }
    sciHubUrl = result["scihub-url"];
  });
};

function getHtml(htmlSource) {
  htmlSource = htmlSource[0];
  foundRegex = htmlSource.match(doiRegex);
  if (foundRegex) {
    foundRegex = foundRegex[0].split(";")[0];
    // console.log("Regex: " + foundRegex);
    var creatingTab = browser.tabs.create({
      url: sciHubUrl + foundRegex,
    });
    creatingTab.then();
  } else {
    browser.browserAction.setBadgeTextColor({ color: "white" });
    browser.browserAction.setBadgeBackgroundColor({ color: trueRed });
    browser.browserAction.setBadgeText({ text: ":'(" });
  }
}

function executeJs() {
  const executing = browser.tabs.executeScript({
    code: "document.documentElement.innerHTML",
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
iniitalizeUrl();
