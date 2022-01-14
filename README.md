# ReSpec to EPUB

Typescript program to convert W3C documents, produced by [ReSpec](https://github.com/w3c/respec), to EPUB 3.3.

## Single documents vs. Collections

The conversion can:

* Convert a single HTML source that was produced by [ReSpec](https://github.com/w3c/respec).
* Convert a single HTML source that has to be pre-processed by [ReSpec](https://github.com/w3c/respec) to get its final formats; the conversion pre-processes the source on the fly.
* Convert a “collection“ of HTML sources (to be pre-processed or not) into one EPUB 3 instance.

## Package usage

### Command line usage

There is a simple command line interface to run the script. See the the separate [documentation on cli](modules/_r2epub_.html) for details and examples.

### Run a service via HTTP

There is also the possibility to run a simple server to generate EPUB 3.3 instances on request. See the separate [documentation on the server](modules/_server_.html) for details and example.

The server has been deployed on the cloud at [heroku](https://r2epub.herokuapp.com/) using the `https://r2epub.herokuapp.com/` URL, as well at [W3C](https://labs.w3.org/r2epub) using the `https://labs.w3.org/r2epub` URL. A [browser interface](https://iherman.github.io/r2epub/convert.html) to drive this server is also available.

### Use as a typescript/node package through an API

The program can also be used from another Typescript or Javascript program. In Typescript, the simplest access is through:

``` js
import * as r2epub  from 'r2epub';
import * as fs      from 'fs';
// The creation itself is asynchronous (the content has to be fetched over the wire).
// The result is the class instance encapsulating an OCF (zip) content
const url :string = "http://www.example.org/doc.html",
const args :r2epub.Options = {
    respec : false,
    config : {}
};
const ocf :r2epub.OCF = await r2epub.convert(url, args);
// The zip file is finalized asynchronously
const content :Buffer = await ocf.get_content();
// Get the content out to the disk
fs.writeFileSync(ocf.name, content);
```

The same in Javascript:

``` js
const r2epub  = require('r2epub');
// The creation itself is asynchronous (the content has to be fetched over the wire).
// The result is the class instance encapsulating an OCF (zip) content
const url = "http://www.example.org/doc.html",
const args  = {
    respec : false,
    config : {}
};
const ocf = await r2epub.convert(url, args);
// The zip file is finalized asynchronously
const content = await ocf.get_content();
// Get the content out to the disk
fs.writeFileSync(ocf.name, content);
```

See the specification of the [convert](https://iherman.github.io/r2epub/typedoc/modules/_index_.html#convert) function and the [OCF](https://iherman.github.io/r2epub/typedoc/classes/_lib_ocf_.ocf.html) class for further details.

## Installation, usage

The implementation is in Typescript and on top of `node.js`.  The documentation is also available [on-line](https://iherman.github.io/r2epub/typedoc/).

Note that the on-the-fly conversion via ReSpec is done by running the <a href="https://github.com/w3c/spec-generator">W3C’s Spec Generator</a>. Alas!, that service may be down or slow, and this package has no control over that…

### Installation

The usual `npm` approach applies:

``` sh
git clone https://github.com/iherman/r2epub.git
cd r2epub
npm install
```

or simply use

``` sh
npm install r2epub
```

to get to the latest, published version.

The repository contains both the typescript code (in the `src` directory) as well as the transformed javascript code (in the `dist` directory). If, for some reasons, the latter is not in the repository or is not up to date, the

``` sh
npm run build
```

command takes care of that. The documentation can also be generated locally through the

``` sh
npm run docs
```

command.

#### Environment variables

* **`PORT` or `R2EPUB_PORT`:** the port number used by the server; failing these the default (i.e., 80) is used. (`PORT` takes precedence over `R2EPUB_PORT`.)
* **`R2EPUB_LOCAL`:** By default, no URL-s on `localhost` are accepted, unless this environment variable set (the value of the variable is not relevant, only the setting is). For security reasons this variable should not be set for deployed servers.
* **`R2EPUB_MODIFIED_EPUB_FILES`:** A number of W3C specific files (logos, some css files) had to be adapted for EPUB 3 usage, and are retrieved from a separate site. At the moment, `https://www.ivan-herman.net/r2epub/` is used as a base URL for those files. However, if the variable is set, its value is used as a prefix for the copy of the files on the local file system and the files are read directly from the disc. (Typically, the value points at `docs/epub_assets/` in the local clone of the distribution.)

    (Some server may have problems with a burst of access to the same base URL resulting in run-time error, hence the advantage to use this type of setup.)


### Usage

Once installed locally, follow specific instructions based on your needs/interest below:

#### Command Line

``` sh
node dist/r2epub.js
```

starts the command line interface.

By default, no URL-s on `localhost` are considered as safe and are therefore rejected, _unless_ the environment variable `R2EPUB_LOCAL` is explicitly set (the value of the variable is not relevant, only the setting is).

#### Server

``` sh
node dist/server.js
```

starts up the server locally.

---

Copyright © 2020 [Ivan Herman](https://www.ivan-herman.net) (a.k.a. [@iherman](https://github.com/iherman)).
