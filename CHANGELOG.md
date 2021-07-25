# Changelog

## TODO

- [ ] Custom auto-naming formats
- [ ] Better journal/venue abbreviations
- [ ] Better `shorttitles` in metadata
- [ ] Custom email address to use with doi.crossref.org
- [ ] Test unreleased changes on firefox & edge, and also check permissions differences amongst different browsers

## Unreleased

### Added
- #25 Auto-download pdf & auto-naming
  - The user can opt to automatically download a pdf and bypass actually visiting sci-hub by enabling the setting in the options page.
  - Enabling auto-name will (if auto-download is enabled) automatically name the downloaded pdfs according to the naming convention `LastnameYearVenue_shorttitle.pdf`.  For example, `Grady19vppc_mostEfficientVehicle.pdf` for [10.1109/VPPC46532.2019.8952212](https://doi.org/10.1109/VPPC46532.2019.8952212).  Note that the `shorttitle` is almost always missing from the metadata.

## v0.1.0

### Added
- List of active sci-hub links and javascript status checker
  - In the options page, a table of active links is populated from a github json file and color-coded green/red for working/not working
  - Upon requesting a paper, the extension will auto-check if the server is not working and prompt the user to go to the options page to select a working link.
- Option to open sci-hub paper in current tab rather than new tab
