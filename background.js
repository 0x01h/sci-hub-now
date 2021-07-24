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

var mostRecentDoi = "";
var mostRecentMetadata = {};

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
    if (confirm("Looks like the mirror "+sciHubUrl+" is dead.  Would you like to go to the options page to select a different mirror?")) {
      browser.tabs.create({url: 'chrome://extensions/?options=' + chrome.runtime.id}).then();
    }
  }
  img.src = sciHubUrl + "/misc/img/raven_1.png";
}

function getApiQueryUrl(doi, email) {
  return 'https://doi.crossref.org/servlet/query' + '?pid=' + email + '&id=' + doi;
}
function createFilenameFromMetadata(metadata) {
  return metadata['author'] + metadata['year'] + metadata['journal'] + "_" + metadata['shorttitle'];
}
function downloadPaper(link, fname) {
  chrome.downloads.download({
    url: link,
    filename: fname
  });
}

function getHtml(htmlSource) {
  htmlSource = htmlSource[0];
  foundRegex = htmlSource.match(doiRegex);
  if (foundRegex) {
    foundRegex = foundRegex[0].split(";")[0];
    mostRecentDoi = foundRegex;
    // console.log("Regex: " + foundRegex);
    if (openInNewTab) {
      var creatingTab = browser.tabs.create({
        url: sciHubUrl + foundRegex,
      });
      creatingTab.then();
    } else {
      const email = 'gchenfc.developer@gmail.com';
      browser.tabs.update(undefined, { url: getApiQueryUrl(foundRegex, email) });
      // browser.tabs.update(undefined, {url: sciHubUrl + foundRegex});
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
  contexts: ["selection","link"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  // if right-clicked on link, then parse link address first
  var doi = info.linkUrl;
  doi = doi ? doi.match(doiRegex)[0].split(";")[0] : doi;
  // if link not valid, try the highlighted text
  if (!doi) {
    doi = info.selectionText;
  }
  var creatingTab = browser.tabs.create({
    url: sciHubUrl + doi,
  });
});

browser.browserAction.onClicked.addListener(executeJs);
browser.tabs.onUpdated.addListener(resetBadgeText);
for (const property in defaults) {
  initialize(property);
}

// Messages from content scripts
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.pdfUrl) {
      downloadPaper(request.pdfUrl, createFilenameFromMetadata(mostRecentMetadata));
      // go back
      let queryOptions = { active: true, currentWindow: true };
      chrome.tabs.query(queryOptions, (tabs) => {
        chrome.tabs.goBack(tabs[0].id);
      });
    }
    else if (request.metadata) {
      mostRecentMetadata = request.metadata;
      browser.tabs.update(undefined, { url: sciHubUrl + mostRecentDoi });
    } else {
      alert("unknown message");
    }
  }
);
