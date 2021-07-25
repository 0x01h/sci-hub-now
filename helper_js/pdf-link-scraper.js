const pdfRegex = new RegExp(/iframe\s*src\s*=\s*"(.*?\.pdf)/);

function getPdfDownloadLink(htmlSource) {
  foundRegex = htmlSource.match(pdfRegex);
  console.log(foundRegex);
  if (foundRegex) {
    toReturn = foundRegex[1];
    if (toReturn.startsWith("//")) { // quirk of sci-hub.st
      toReturn = "https:" + toReturn;
    }
    return toReturn;
  }
}

// getPdfDownloadLink(document.body.innerHTML);
