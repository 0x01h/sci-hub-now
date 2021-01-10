'use strict';

function updatePageString(field, propname, isUrl) {
  chrome.storage.local.get([propname], function (result) {
    field.value = result[propname];
    if (isUrl) {
      checkServerStatus(field.value, -1,
        function () {
          field.style.backgroundColor = "lightgreen";
        }, function () {
          field.style.backgroundColor = "pink";
        });
    }
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
function updateStuffString(field, propname, isUrl) {
  updatePageString(field, propname, isUrl);
  field.onkeyup = function () {
    updateStorage(field.value, propname);
    if (isUrl) {
      checkServerStatus(field.value, -1,
        function () {
          field.style.backgroundColor = "lightgreen";
        }, function () {
          field.style.backgroundColor = "pink";
        });
    }
  }
}
function updateStuffBool(field, propname) {
  updatePageBool(field, propname);
  field.onchange = function () {
    updateStorage(field.checked, propname);
  }
}
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

updateStuffBool(document.getElementById("newtab"), "open-in-new-tab");
updateStuffString(document.getElementById("url"), "scihub-url", true);

// fetch urls
var links;
var linkstable = document.getElementById("links");
function setUrl(i) {
  document.getElementById("url").value = links[i];
  updateStorage(links[i], "scihub-url");
  document.getElementById("url").style.backgroundColor = linkstable.rows[parseInt(i)+1].bgColor;
}
function fillUrls() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      links = JSON.parse(this.responseText);
      for (const i in links) {
        linkstable.insertRow();
        linkstable.rows[linkstable.rows.length-1].innerHTML = "<td>"+links[i]+'</td><button id="link'+i+'">Select</button>';
        document.getElementById("link" + i).onclick = function () { setUrl(i); }
      }
      console.log(linkstable.rows[links.length])
      console.log(links);
      for (const i in links) {
        checkServerStatus(links[i], i,
          function () {
            linkstable.rows[parseInt(i)+1].bgColor = "lightgreen";
          }, function () {
            linkstable.rows[parseInt(i)+1].bgColor = "pink";
          })
      }
    }
  };
  xmlhttp.open("GET", "https://raw.githubusercontent.com/gchenfc/sci-hub-now/master/activelinks.json", true);
  xmlhttp.send();
}
fillUrls();
// document.getElementById("autofetch").onclick = function () {
//   function ifOnline(i) {
//     console.log(links[i]+" is valid :)");
//     console.log("working domain is "+links[i]);

//     linkstable.rows[i+1].bgColor = "lightgreen";
//     setUrl(i);
//   };
//   function ifOffline (i) {
//     console.log(links[i]+" is INVALID");
//     linkstable.rows[i+1].bgColor = "pink";
//     checkServerStatus(links[i+1], i+1, ifOnline, ifOffline);
//   };
//   ifOffline(-1);
// };
