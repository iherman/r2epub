# ReSpec to EPUB

Typescript program to convert W3C documents, produced by [ReSpec](https://respec.org/docs/), to EPUB 3.4.

> **Warning:** the detailed API documentation is not perfect, because the `deno doc --html` command doesn't do as good a job as, say, `typedoc`. (Mixing `typedoc` and `deno` is not a viable alternative either…). 

## Single documents vs. Collections

The conversion can:

* Convert a single HTML source produced by [ReSpec](https://respec.org/docs/).
* Convert a single HTML source that must be pre-processed by [ReSpec](https://respec.org/docs/) to get its final formats; the program pre-processes the source on the fly.
* Convert and combine a “collection“ of HTML sources (to be pre-processed or not) into a single EPUB 3 document.

(The on-the-fly conversion via ReSpec is done by running the [W3C’s Spec Generator service](https://github.com/w3c/spec-generator). Alas!, that service may be down or slow, and this package has no control over that…)

## Package usage

### Command line usage

There is a simple command line interface to run the script. See the the separate [documentation on cli](https://iherman.github.io/r2epub/doc/cli/) for details and examples.

### Run a service via HTTP

There is also the possibility to start a simple server to generate EPUB 3.4 instances on request. See the separate [documentation on the server](https://iherman.github.io/r2epub/doc/serve/) for details and examples of HTTP requests.

The server has been deployed on the cloud at [W3C](https://labs.w3.org/r2epub) using the `https://labs.w3.org/r2epub` URL. A [browser interface](https://iherman.github.io/r2epub/convert.html) to drive this server is also available. (Note that the server running on W3C is also used to generate an EPUB version of a document based on respec directly from the respec `export` facility.)

### Use as a typescript package through an API

The program can be run from `deno` (relying on the jsr package [`@iherman/r2epub`](https://jsr.io/@iherman/r2epub)). See the separate [documentation on the API](https://iherman.github.io/r2epub/doc/) for details and examples of the API usage.


#### Environment variables

* **`PORT` or `R2EPUB_PORT`:** the port number used by the server; failing these the default (i.e., 80) is used. (`PORT` takes precedence over `R2EPUB_PORT`.)
* **`R2EPUB_LOCAL`:** no URL-s on `localhost` are accepted, unless this environment variable set (the value of the variable is not relevant, only the setting is). For security reasons this variable should not be set for deployed servers and its usage is advised for local testing purposes only.
* **`R2EPUB_MODIFIED_EPUB_FILES`:** A number of W3C specific files (logos, some css files) had to be adapted for EPUB 3 usage, and are retrieved from a separate site. At the moment, `https://www.w3.org/People/Ivan/r2epub/` is used as a base URL for those files. If the environment variable is set, its value is used as a prefix for the copy of the files on the local file system and the files are read directly from the disc. 
    
    (The local clone of the distribution has a copy of all the necessary files, too, and can be used for local testing via `localhost`. Some server may have problems with a burst of access to the same base URL resulting in run-time error, hence the advantage to use this local alternative to setup.)


### Usage

The programs can be run without any local installation as follows:

```
deno run -A jsr:@iherman/r2epub/cli [filename]
```

starts up the command line interpreter to convert the file in the argument. A local server can also be started as follows:

```
deno run -A jsr:@iherman/r2epub/serve
```

If the repository is locally cloned, the following two commands can be used in the repository to run the command line interpreter or the server, respectively:

``` sh
deno run -A r2epub.ts [filename]
deno run -A serve.ts
```

Finally, issuing

```sh
deno task compile
```

on the local repository clone generates the executables `r2epub` and `serve` that can be moved and/or renamed at will.


## Externally accessible entry points
 
r2epub can also be used as a library module both to TypeScript and to Javascript. A simple example In Typescript (using `deno`) is as follows:

```js
import * as r2epub  from 'jsr:@iherman/r2epub';
import * as fs      from 'node:fs';

// The creation itself is asynchronous (the content has to be fetched over the wire).
// The result is the class instance encapsulating an OCF (zip) content
const url :string = "http://www.example.org/doc.html",
const args :r2epub.Options = {
    respec : false,
    config : {}
};
const ocf :r2epub.OCF = await r2epub.convert(url, args);

// The zip file is finalized asynchronously; it is a Buffer or an ArrayBuffer, depending on the run-time environment
const content = await ocf.get_content();

// Get the content out to the disk
fs.writeFileSync(ocf.name, content);
```

The same can be done in `node.js` by installing the `r2epub` package from `npm`.

See the detailed specification of the API elements. The top level functional entry point to the package is [convert](https://iherman.github.io/r2epub/convert.html).


---

Copyright © 2025 [Ivan Herman](https://www.ivan-herman.net) (a.k.a. [@iherman](https://github.com/iherman)).
