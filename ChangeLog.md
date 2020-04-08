# Version 1.0.1

* When invoking the `spec-generator` service, respec arguments are HTTP encoded. Although the spec generator does work without encoding in some cases, it does not for all combinations. Properly encoding the HTTP is safer (and also standard compliant...).
* The usage of the `-r` flag in the CLI (resp. the `respec=true` query parameter for the server) is not required in case any of the respec flags/parameters (`specStatus`, `publishDates`, etc.) are used; that flag/parameter is then implied.
* Simplified the BG/CG draft and final reports, by removing the "logo" file and essentially removing the extra CSS for them (except for the watermarks, when needed). The CG/BG logos are significant on the top of the TOC (and the TOC is gone) and that forces to have a large left space for the TOC that is not use for EPUB. Hence its removal.
* Changed the `base.css` a bit to minimize the left padding (unnecessary with the TOC removed).
    * It is still true that the documents are typeset with, for my taste, too narrow bodies, but I am afraid that reading systems take over the control over that. Maybe a chat with some reading system people is warranted for this.
* The logo and css files, adapted for EPUB usage (e.g., `base.css`, W3C logos, etc) are served [from github](https://iherman.github.io/r2epub/epub_assets/) instead of my page on W3C.
* Changed the server implementation in such a way that if no URL (or query string) is provided, it displays a static page with some basic information.
* Added a `Procfile`, which is necessary for a [Heroku](https://heroku.com) deployment of the server.
* Documentation improvements.
