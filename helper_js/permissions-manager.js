const promisifyPermission = (func, ...args) => {
  return new Promise((resolve, reject) => {
    func(...args, (result) => {
      if (result) resolve();
      reject();
    })
  });
}

function metadataFailMsg() {
  return "The permission request for \"Sci-Hub X Now!\" to access the doi metadata query service by https://doi.crossref.org failed." +
    "\nThe auto-naming feature will now be disabled but other functionality" + (propnameValueCache["autodownload"] ? " (including auto-downloading) " : " ") + "will continue to work." +
    "\nYou may re-enable auto-naming at any time by going to the options page (right click the extension icon and click \"Options\") then selecting the \"Auto-name downloaded pdf's\" checkbox.";
}
function requestCorsPermissionMetadata() {
  request = {
    origins: ['https://doi.crossref.org/servlet/query*']
  };
  return promisifyPermission(chrome.permissions.contains, request)
    .catch(
      (reason) => {
        console.log("metadata contains failed");
        return promisifyPermission(chrome.permissions.request, request);
      })
    .catch(
      (reason) => {
        return Promise.reject(metadataFailMsg());
      }
    );
}

function scihubFailMsg(sciHubUrl) {
  return "The permission request for \"Sci-Hub X Now!\" to access the sci hub url: `" + sciHubUrl + "` failed." +
    "\nThe auto-download feature will now be disabled but redirecting doi's to sci-hub will continue to work." +
    "\nYou may re-enable auto-downloading at any time by going to the options page (right click the extension icon and click \"Options\") then selecting the \"Auto-download pdf's\" checkbox.";
}
function requestCorsPermissionScihub(sciHubUrl) {
  sciHubUrl = sciHubUrl.replace(/\/$/, ""); // strip trailing /
  const request = {
    permissions: ['downloads'],
    origins: [sciHubUrl + '/*'] // this is needed to query for the pdf link
  };

  return promisifyPermission(chrome.permissions.contains, request)
    .catch(
      (reason) => {
        console.log("metadata contains failed");
        return promisifyPermission(chrome.permissions.request, request);
      })
    .catch(
      (reason) => {
        return Promise.reject(scihubFailMsg(sciHubUrl));
      }
    );
}
