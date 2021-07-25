'use strict';

// Field access
const propnameFieldnameMap = {
  "autodownload": "autodownload",
  "autoname": "autoname",
  "open-in-new-tab": "newtab",
  "autocheck-server": "autocheck",
  "scihub-url": "url"
};
function getField(propname) {
  return document.getElementById(propnameFieldnameMap[propname]);
}
var propnameValueCache = {};

// Initialization
function initFields() {
  initializeBool("autodownload", autodownloadCallback);
  initializeBool("autoname", autonameCallback);
  initializeBool("open-in-new-tab");
  initializeBool("autocheck-server");
  initializeString("scihub-url", true, scihuburlCallback);
  // autodownloadCallback(propnameValueCache["autodownload"]);
  autodownloadCallback(propnameValueCache["autodownload"]);
  autonameCallback(propnameValueCache["autoname"]);
};
function initializeString(propname, isUrl, alternateCallback) {
  if (!alternateCallback) alternateCallback = () => { return Promise.resolve(null) };
  let field = getField(propname);
  field.value = propnameValueCache[propname];
  field.onchange = function () {
    field.onkeyup();
    updateStorage(field.value, propname);
    alternateCallback(field.value);
  };
  field.onkeyup = function () {
    if (isUrl) {
      checkServerStatus(field.value, -1,
        function () {
          field.style.backgroundColor = "lightgreen";
        }, function () {
          field.style.backgroundColor = "pink";
        });
    }
  };
}
function initializeBool(propname, alternateCallback) {
  if (!alternateCallback) alternateCallback = () => { return Promise.resolve(null) };
  let field = getField(propname);
  field.checked = propnameValueCache[propname];
  field.onchange = function () {
    console.log(propname + " callback!");
    alternateCallback(field.checked).then(() => { updateStorage(field.checked, propname); });
  };
}

// Callbacks
function autodownloadCallback(checked) {
  console.log("autodownload callback: " + checked);
  getField("autoname").disabled = !checked;
  if (checked) {
    return new Promise((resolve, reject) => {
      requestCorsPermissionScihub(propnameValueCache["scihub-url"]).then(
        (reason) => { console.log("completed scihub callback"); resolve(reason) },
        (reason) => {
          console.log("Scihub permission request failed");
          updateStorage(false, "autodownload");
          getField("autodownload").checked = false;
          getField("autoname").disabled = true;
          reject(reason);
        }
      );
    });
  } else {
    return Promise.resolve("no additional permissions required");
  }
};
function autonameCallback(checked) {
  console.log("autoname callback: " + checked);
  if (checked) {
    return new Promise((resolve, reject) => {
      requestCorsPermissionMetadata().then(
        (reason) => { console.log("completed metadata callback"); resolve(reason) },
        (reason) => {
          console.log("Metadata permission request failed");
          updateStorage(false, "autoname");
          getField("autoname").checked = false;
          reject(reason);
        }
      );
    });
  } else {
    return Promise.resolve("no additional permissions required");
  }
}
function scihuburlCallback(url) {
  console.log("url callback");
  return autodownloadCallback(propnameValueCache["scihub-url"]);
}
function noop() { }

// Variable storage
function updateStorage(val, propname) {
  propnameValueCache[propname] = val;
  var obj = {};
  obj[propname] = val;
  chrome.storage.local.set(obj, function () { });
  console.log("updated storage for " + propname + ": " + val);
};

// Run start code here
chrome.storage.local.get(Object.keys(propnameFieldnameMap), function (result) {
  for (const [key, value] of Object.entries(result)) {
    propnameValueCache[key] = value;
  }
  console.log("result is: ", result);
  console.log("cache is: ", propnameValueCache);
  initFields();
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    for (const key in changes) {
      const value = changes[key].newValue;
      if (value == propnameValueCache[key]) { // prevent infinite recursion
        continue;
      }
      propnameValueCache[key] = value;
      if (key == "scihub-url") {
        getField("scihub-url").value = value;
      } else {
        getField(key).checked = value;
      }
      getField(key).onchange();
    }
  }
});










// Code related to color-coding and populating sci-hub links

function checkServerStatus(domain, i, ifOnline, ifOffline) {
  var img = document.body.appendChild(document.createElement("img"));
  img.height = 0;
  img.visibility = "hidden";
  img.onload = function () {
    ifOnline && ifOnline.constructor == Function && ifOnline(i);
  };
  img.onerror = function () {
    ifOffline && ifOffline.constructor == Function && ifOffline(i);
  }
  // img.src = domain + "/favicon.ico";
  img.src = domain + "/misc/img/raven_1.png";
}

// fetch urls
var links;
var linkstable = document.getElementById("links");
function setUrl(i) {
  const field = getField("scihub-url");
  field.value = links[i];
  propnameValueCache["scihub-url"] = links[i];
  field.onchange();
  // updateStorage(links[i], "scihub-url");
  // field.style.backgroundColor = linkstable.rows[parseInt(i) + 1].bgColor;
}
function fillUrls() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      links = JSON.parse(this.responseText);
      for (const i in links) {
        linkstable.insertRow();
        linkstable.rows[linkstable.rows.length - 1].innerHTML = "<td>" + links[i] + '</td><button id="link' + i + '">Select</button>';
        document.getElementById("link" + i).onclick = function () { setUrl(i); }
      }
      console.log(linkstable.rows[links.length])
      console.log(links);
      for (const i in links) {
        linkstable.rows[parseInt(i) + 1].bgColor = "#aaa";
        checkServerStatus(links[i], i,
          function () {
            linkstable.rows[parseInt(i) + 1].bgColor = "lightgreen";
          }, function () {
            linkstable.rows[parseInt(i) + 1].bgColor = "pink";
          })
      }
    }
  };
  xmlhttp.open("GET", "https://raw.githubusercontent.com/gchenfc/sci-hub-now/master/activelinks.json", true);
  xmlhttp.send();
}

fillUrls();
