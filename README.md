# ReSpec to EPUB

Typescript program to convert W3C documents, produced by [ReSpec](https://github.com/w3c/respec), to EPUB 3.2.

## Single documents vs. Collections

The conversion can:

* Convert a single HTML source that was produced by [ReSpec](https://github.com/w3c/respec).
* Convert a single HTML source that has to be pre-processed by [ReSpec](https://github.com/w3c/respec) to get its final formats; the conversion pre-processes the source on the fly.
* Convert a “collection“ of HTML sources (to be pre-processed or not) into one EPUB 3 instance.

## Package usage

### Command line usage

There is a simple [cli](https://iherman.github.io/r2epub/typedoc/modules/_cli_.html#cli), which works as follows:

```sh
Usage: r2epub [options] [url]

Convert the file or collection configuration at [url] to EPUB 3.2

Options:
  -V, --version               output the version number
  -o, --output <fname>        output file name. If missing, the short name of the document is used
  -r, --respec                the source must be pre-processed by ReSpec (default: false)
  -s, --specStatus <type>     specification type
  -d, --publishDate <date>    publication date
  -l, --addSectionLinks       add section links with "§".
  -m, --maxTocLevel <number>  maximum TOC level
  -h, --help                  display help for command
  ```

The URL may refer to either a single HTML source, or a JSON file serving as a “collection configuration file”. See the [collection configuration format](https://iherman.github.io/r2epub/typedoc/modules/_clib_args_.html) for the details.

For details on the `-d`, `-s`, `-l`, or `-m` flags, see the [ReSpec manual](https://www.w3.org/respec/). If any of those flags is set, `-r` is implied (i.e., it is not necessary to set it explicitly).

In the absence of the `-o` flag the output will be `shortName.epub`, where the value of `shortName` is extracted from the [ReSpec configuration](https://github.com/w3c/respec/wiki/shortName).

### Run a service via HTTP

There is a simple server implemented in the [serve](https://iherman.github.io/r2epub/typedoc/modules/_server_.html) module: querying that Web server generates EPUB 3.2 instances. The API for the service is based on for URL-s of the sort:

```sh
https://epub.example.org?url=https://www.example.org/doc.html
```

This would create and return the EPUB 3.2 instance corresponding to `https://www.example.org/doc.html`. Query parameters for `respec`, `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel` can be added, just like for the command line. I.e.,

``` sh
https://epub.example.org?url=https://www.example.org/doc.html&respec=true&specStatus=REC
```

converts the original file via respec, with the `specStatus` value set to `REC`. If one of `publishDate`, `specStatus`, `addSectionLinks`, or `maxTocLevel` are set, `respec=true` is implied (i.e., it is not necessary to set it explicitly).

```sh
https://epub.example.org?url=https://www.example.org/collection.json
```

generates a collection, described by the configuration file. (See the [separate module](https://iherman.github.io/r2epub/typedoc/modules/_clib_args_.html) for more details on the configuration file.)

The server has been deployed on the cloud at [heroku](https://r2epub.herokuapp.com/) using the `https://r2epub.herokuapp.com/` URL. A [client side interface](https://iherman.github.io/r2epub/convert.html) to drive this server is also available.

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

Note that the on-the-fly conversion via ReSpec is done by running the <a href="https://github.com/w3c/spec-generator">W3C’s Spec Generator</a>. Alas!, that service may be down, and this package has no control over that…

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
* **`R2EPUB_MODIFIED_EPUB_FILES`:** A number of W3C specific files (logos, some css files) had to be adapted for EPUB 3 usage, and are retrieved from a separate site. At the moment, `https://www.ivan-herman.net/r2epub/` is used as a base URL for those files (but can also be set explicitly in a [separate module](https://iherman.github.io/r2epub/typedoc/modules/_lib_constants_.html) at installation). However, if the variable is set, its value is used as a prefix for the copy of the files on the local file system and the files are read directly from the disc. (Typically, the value points at `docs/epub_assets/` in the local clone of the distribution.)

    (Some server may have problems with a burst of access to the same base URL resulting in run-time error, hence the advantage to use this type of setup.)


### Usage

Once installed locally, follow specific instructions based on your needs/interest below:

#### Command Line

``` sh
node dist/cli.js
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
