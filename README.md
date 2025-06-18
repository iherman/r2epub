# ReSpec to EPUB

> Warning: this repository undergoes a major change, and is not in line with the corresponding package on npm...

Typescript program to convert W3C documents, produced by [ReSpec](https://respec.org/docs/), to EPUB 3.4.

## Single documents vs. Collections

The conversion can:

* Convert a single HTML source produced by [ReSpec](https://respec.org/docs/).
* Convert a single HTML source that must be pre-processed by [ReSpec](https://respec.org/docs/) to get its final formats; the program pre-processes the source on the fly.
* Convert and combine a “collection“ of HTML sources (to be pre-processed or not) into a single EPUB 3 document.

(The on-the-fly conversion via ReSpec is done by running the <a href="https://github.com/w3c/spec-generator">W3C’s Spec Generator service</a>. Alas!, that service may be down or slow, and this package has no control over that…)

## Package usage

### Command line usage

There is a simple command line interface to run the script. See the the separate [documentation on cli](https://iherman.github.io/r2epub/doc/cli/) for details and examples.

### Run a service via HTTP

There is also the possibility to start a simple server to generate EPUB 3.4 instances on request. See the separate [documentation on the server](https://iherman.github.io/r2epub/doc/serve/) for details and examples of HTTP requests.

The server has been deployed on the cloud at [W3C](https://labs.w3.org/r2epub) using the `https://labs.w3.org/r2epub` URL. A [browser interface](https://iherman.github.io/r2epub/convert.html) to drive this server is also available.

(Note that the server running on W3C is also used to generate an EPUB version of a document based on respec, using its `export` facility.)

### Use as a typescript/node package through an API

The program can be run from `deno` (relying on the jsr package [`@iherman/r2epub`](https://jsr.io/@iherman/r2epub)) or from `node.js` (relying on the npm package [`r2epub`](https://www.npmjs.com/package/r2epub)). See the separate [documentation on the API](https://iherman.github.io/r2epub/doc/) for details and examples of the API usage.


#### Environment variables

* **`PORT` or `R2EPUB_PORT`:** the port number used by the server; failing these the default (i.e., 80) is used. (`PORT` takes precedence over `R2EPUB_PORT`.)
* **`R2EPUB_LOCAL`:** no URL-s on `localhost` are accepted, unless this environment variable set (the value of the variable is not relevant, only the setting is). For security reasons this variable should not be set for deployed servers.
* **`R2EPUB_MODIFIED_EPUB_FILES`:** A number of W3C specific files (logos, some css files) had to be adapted for EPUB 3 usage, and are retrieved from a separate site. At the moment, `https://www.w3.org/People/Ivan/r2epub/` is used as a base URL for those files. However, if the variable is set, its value is used as a prefix for the copy of the files on the local file system and the files are read directly from the disc. (The value may point at `docs/epub_assets/` in the local clone of the distribution; this folder has all the necessary files.)

    (Some server may have problems with a burst of access to the same base URL resulting in run-time error, hence the advantage to use this local alternative to setup.)


### Usage

Once installed locally, follow specific instructions based on your needs/interest below:

#### Command Line

``` sh
deno run -A r2epub.ts
```
starts the command line interface.

#### Server

``` sh
deno run -A serve.ts
```

starts up the server locally.

---

Copyright © 2025 [Ivan Herman](https://www.ivan-herman.net) (a.k.a. [@iherman](https://github.com/iherman)).
