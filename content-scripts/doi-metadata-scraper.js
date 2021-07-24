const metadataRegex = new RegExp(/.*?\|(.*?)\|(.*?)\|.*?\|.*?\|.*?\|(.*?)\|.*?\|(.*?)\|(.*)/);

function extractMetadata(metadata_str) {
  let matches = metadata_str.match(metadataRegex);
  let metadata = {
    journal: matches[1],
    author: matches[2],
    year: matches[3],
    shorttitle: matches[4],
    doi: matches[5]
  };

  chrome.runtime.sendMessage({ metadata: metadata });
}

extractMetadata(document.body.innerText);
