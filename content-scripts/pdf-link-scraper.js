const pdfRegex = new RegExp("http.*\.pdf");

function getPdfDownloadLink(htmlSource) {
  foundRegex = htmlSource.match(pdfRegex);
  if (foundRegex) {
    alert("Found link! " + foundRegex + ".  Downloading...");
    chrome.runtime.sendMessage({ pdfUrl: foundRegex[0] });
  }
}

getPdfDownloadLink(document.body.innerHTML);
