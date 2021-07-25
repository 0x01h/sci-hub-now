const metadataRegex = new RegExp(/.*?\|([^\|]+?)\|([^\|]+?)\|[^\|]*?\|[^\|]*?\|[^\|]*?\|([^\|]+?)\|[^\|]*?\|([^\|]*?)\|([^\|]*)/);
const venueAbbreviations = {
  "Transactions on Robotics": "TRO",
  "International Conference on Robotics and Automation": "ICRA",
  "International Conference on Intelligent Robots and Systems": "IROS",
  "Proceedings of Robotics: Science and Systems": "RSS",
  "International Journal of Robotics Research": "IJRR"
};

function extractLastName(fullname) {
  let lastname = fullname.match(/.*\s(.*)/);
  if (lastname) {
    return lastname[1];
  } else {
    return fullname;
  }
};
function abbreviateVenue(venue) {
  // First loop through our hard-coded list
  for (const property in venueAbbreviations) {
    if (venue.includes(property)) {
      return venueAbbreviations[property].toLowerCase();
    }
  }
  // If it doesn't match any entries, then just take the first letter of each capitalized word.
  let capitalLetters = venue.match(/[A-Z]/g);
  return capitalLetters.join('').toLowerCase();
};
function extractMetadata(metadata_str) {
  let matches = metadata_str.match(metadataRegex);
  if (!matches) {
    alert("Could not parse the metadata file!\n" + metadata_str);
    return null;
  }
  let metadata = {
    venue: matches[1],
    author: matches[2],
    year: matches[3],
    shorttitle: matches[4],
    doi: matches[5],
  };
  metadata.authorlastname = extractLastName(metadata.author);
  metadata.shortvenue = abbreviateVenue(metadata.venue);
  metadata.yearmod100 = metadata.year.slice(-2);

  return metadata;
};

// extractMetadata(document.body.innerText);
