# Changes

## Version 1.2.1

### Detailed (important) changes

* Bug fix: if the editor does not provide an affiliation, `undefined` was put into the result. It ignores this field now.

## Version 1.2.0

_The client side version has been definitely ditched. It looks like `browserify` with typescript is overly erratic, and sometimes does not link entries that out to be linked and there is no visible reason why..._

### (Main) New Features

* The client side version (ie, code embedded in the browser) has been ditched.
* There is now a separate functionality on “collections”, i.e., the possibility to bind several documents into one EPUB. This means one can generate an EPUB 3.2 document that comprises several W3C documents. E.g., one can create a JSON-LD 1.1 EPUB 3.2 that includes the JSON-LD 1.1 Syntax, JSON-LD 1.1 API, JSON-LD 1.1 Framing, and Streaming JSON-LD specifications.
* The generated EPUB is now conforms with the EPUB A11y requirements: contains the A11y metadata. Note that it is set to be conform to WCAG Level A if all content is either a Rec or a WG/IG Note (i.e., the document is supposed to have been checked with the W3C pubrules' checker)

## Version 1.1.2

### Detailed (important) changes

* A document may have a reference to its own EPUB version (if explicitly listed as an alternate format for the document). This may lead to a self-referencing loop; that reference is now removed from the target
* Per EPUB 3.2 spec an `a` element, when referring to a local file, can only do that if:
    1. the resource is explicitly listed in the `spine` of the OPF element with a `linear='no'` attribute set
    2. the content is a valid content type, i.e., currently XHTML or SVG. While that is fine for SVG, referring to an HTML content like that may lead to problems, because that should also be in XHTML (i.e., it would involve a conversion) and the same rule applies to that content as well, i.e., the script should be prepared to handle HTML files recursively.

    Case (2) is rarely occurring, though, mainly for HTML. It may occur, however, for other types of content, like images, data files, etc. What has been implemented now is:
    * an SVG resource, explicitly linked to via a `a` element, is also added to the spine with `linear='no'` set
    * for all other resources linked to via a `a` element the reference is exchanged against an absolute URL pointing at the resource in the original place (or the `TR` space on W3C if the document itself is on localhost)

## Version 1.1.1

### (Main) New Feature

* The code is again embeddable in the browser. (Browserify has re-started working as if by magic...)
* There is now a "partner" project, called [rs2epub](https://github.com/iherman/rs2epub/) and built on top of r2epub, to build EPUB 3.2 out of a _collection_ of ReSpec documents. It was a good test for this release…

### Detailed (important) changes

* Some option values in the client files were in duplicate (removed)
* Created a server interface script to give some visual feedback to the user when converting via a Web interface using the remove service
* By default, the server now listens to the default HTTP Port (ie, 80). The `PORT` environment variable can be used when starting the server to use a different value
* Localhost, as a URL host name, is disallowed, except for the client version or if an explicit `R2EPUB_LOCAL` environmental variable is set. (Better avoid security issues, mainly for the server version.)

## Version 1.1.0

### (Main) New Feature

* Usable as an external module in `node.js`, both using Javascript and Typescript.

### Detailed (important) changes

* _**Unfortunately, browserify has changed in its latest release, and it does not work any more in this release.**_ Commented that out for a while, should investigate further.
* Constructor for the `RespecToEPUB` has now default arguments.
* The package is now ready to be (eventually) uploaded to npm to be used by other node.js and Typescript projects. To do so:
    * All public interfaces were added to one file, named `index.ts`.
    * `package.json` has been modified to include:

        ``` json
        "main": "dist/lib/index.js",
        "types": "src/lib/index.ts",
        ```

        to ensure proper linkage from other modules via npm.
    * The reference to JSZIp had to be changed to `require` even in Typescript. (I am not sure I understand why, but `tsc` worked well for `r2epub` but did not when the same module was linked externally. Oh Well...)
* The `docs/convert.html` is now a simple HTML form that connects to the server as deployed on heroku.

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
