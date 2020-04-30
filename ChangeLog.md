# Changes

## Version 1.1.0

### (Main) New Feature:

* Usable as an external module in `node.js`, both using Javascript and Typescript

### Detailed changes:

* Unfortunately, browserify has changed in its latest release, and it does not work any more in this release. Commented that out, should investigate further.
* Constructor for the `RespecToEPUB` has now default arguments.
* The package is now ready to be (eventually) uploaded to npm to be used by other node.js and Typescript projects. To do so:
    * All public interfaces were added to one file, renamed `convert.ts`.  This was the only way I found to properly link from another Typescript file
    * `package.json` has been modified to include:

        ``` json
        "main": "dist/lib/convert.js",
        "types": "src/lib/convert.ts",
        ```

        to ensure proper linkage from other modules via npm.
    * The reference to JSZIp had to be changed to `require` even in Typscript. (I am not sure I understand why, but `tsc` worked well for `r2epub` but did not when the same module was linked externally. Oh Well...)

## Version 1.0.2

### (Main) New feature

* Code embeddable into a browser.

### Detailed list of changes

* Reorganized the documentation folder organization, allowing the creation of other content besides the code documentation (used for a browser version, for example)
* Removed the `URL` type (was just an alias to `string`) in `fetch.ts`: it turns out the URL is a global name in Typescript and browsers, and is not a good practice to shadow such name...
* Changes for “browserify”:
    * a separate `browser.ts` top level module
    * combination of `tsc` and `browserify` to produce `r2epub.js` and `r2epub.min.js` in `docs/assets/js`; this is the javascript file to be in included for client-side conversion
    * `package.json` contains a separate script entry to produce the browser version
    * the flag to decide whether the environment is a browser or node.js has been updated
    * the ocf module makes the choice whether it returns a blob (for a browser) or a Buffer (for node)
    * the fetch resource function makes a choice whether it returns a non-textual output as a blob (for a browser) or as a stream (for node)
* A separate `src/browser.ts` has been added, containing an event handler that can be used from a browser. A `docs/convert.html` has also been added with a simple HTML interface using the browserified script.


## Version 1.0.1

* When invoking the `spec-generator` service, respec arguments are HTTP encoded. Although the spec generator does work without encoding in some cases, it does not for all combinations. Properly encoding the HTTP is safer (and also standard compliant...).
* The usage of the `-r` flag in the CLI (resp. the `respec=true` query parameter for the server) is not required in case any of the respec flags/parameters (`specStatus`, `publishDates`, etc.) are used; that flag/parameter is then implied.
* Simplified the BG/CG draft and final reports, by removing the "logo" file and essentially removing the extra CSS for them (except for the watermarks, when needed). The CG/BG logos are significant on the top of the TOC (and the TOC is gone) and that forces to have a large left space for the TOC that is not use for EPUB. Hence its removal.
* Changed the `base.css` a bit to minimize the left padding (unnecessary with the TOC removed).
    * It is still true that the documents are typeset with, for my taste, too narrow bodies, but I am afraid that reading systems take over the control over that. Maybe a chat with some reading system people is warranted for this.
* The logo and css files, adapted for EPUB usage (e.g., `base.css`, W3C logos, etc) are now served [from github](https://iherman.github.io/r2epub/epub_assets/) instead of my page on W3C.
* Deployed the Web Service is [deployed on heroku](https://r2epub.herokuapp.com/).
    * Changed the server implementation in such a way that if no URL (or query string) is provided, it displays a static page with some basic information.
    * Added a `Procfile`, which is necessary for a [Heroku](https://heroku.com) deployment.
* Documentation improvements.

## Version 1.0.0

First “official” release.
