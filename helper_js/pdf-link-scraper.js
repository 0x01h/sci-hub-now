const pdfRegexes = [
  new RegExp(/location\.href\s*=\s*'([^']*?\.pdf)/),
  new RegExp(/embed\s*type\s*=\s*"application\/pdf"\s*src\s*=\s*"([^"]*?\.pdf)/),
  new RegExp(/iframe\s*src\s*=\s*"([^"]*?\.pdf)/)
];

function getPdfDownloadLink(htmlSource) {
  for (let pdfRegex of pdfRegexes) {
    console.log("regex is: ", pdfRegex);
    foundRegex = htmlSource.match(pdfRegex);
    console.log("foundRegex is: ", foundRegex);
    if (foundRegex) {
      toReturn = foundRegex[1];
      if (toReturn.startsWith("//")) { // quirk of sci-hub.st
        toReturn = "https:" + toReturn;
      }
      return toReturn;
    }
  }
}

// getPdfDownloadLink(document.body.innerHTML);
