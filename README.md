# ReSpec to EPUB

Typescript program to convert W3C documents, produced by [ReSpec](https://github.com/w3c/respec), to EPUB 3.2.

If used from another program, the main entry point are the [[create_epub]] and [[create_epub_from_dom]] methods in the [“process” module](modules/_lib_process_.html), which create the EPUB 3.2 file by submitting a URL and some flags, or the URL and a DOM instance, respectively.

## Package usage

### Command line interface

There is a simple CLI implemented in [[cli]] which works as follows:

```txt
Options:
  --help                 Show help  [boolean]
  -o, --output           The name of the output file [string]
  -r, --respec           The source is in respec  [boolean] [default: false]
  -d, --publishDate      Publication date  [string] [default: null]
  -s, --specStatus       Specification type [string] [default: null]
  -l, --addSectionLinks  Add section links with "§"  [string] [default: null]
  -m, --maxTocLevel      Max TOC level [number] [default: null]
```

For the `-d`, `-s`, `-l`, or `-m` flags, see the [ReSpec manual](https://www.w3.org/respec/). If any of those flags is set, `-r` is implied (i.e., it is not necessary to set it explicitly).

In the absence of the `-o` flag the output will be `shortName.epub`, where the value of `shortName` is extracted from the [ReSpec configuration](https://github.com/w3c/respec/wiki/shortName).

### Server interface

There is a simple server implemented in [[serve]]: running

```txt
node dist/server
```

starts a simple Web server that generate EPUB 3.2 instances for URL-s of the sort:

```
https://epub.example.org?url=https://www.example.org/doc.html
```

This would create and return the EPUB 3.2 instance corresponding to `https://www.example.org/doc.html`. Query parameters for `respec`, `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel` can be added, just like for the command line. I.e.,

```
https://epub.example.org?url=https://www.example.org/doc.html&respec=true&specStatus=REC
```

converts the original file via respec, with the `specStatus` value set to `REC`. If one of `publishDate`, `specStatus`, `addSectionLinks`, or `maxTocLevel` are set, `respec=true` is implied (i.e., it is not necessary to set it explicitly).

By default, the server uses the `http` port number 5000, unless the `PORT` environment variable is set.

The server has been deployed on the cloud, using [heroku](https://r2epub.herokuapp.com/).

### Client-side processing

The module has also been “browserified” and can be run on the client side, i.e., within a browser. A simple form, using the `url`, `respec`,  `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel` entries can be used to trigger the necessary event handler: [[submit]]. The form has been made available through [an online HTML file](https://iherman.github.io/r2epub/server.html).

## Installation, usage

The implementation is in Typescript and on top of `node.js`. The project can be downloaded via cloning and can be installed via a standard `npm` processing; running

```
node dist/cli.js
```

starts the command line interface, while

```
node dist/server
```

starts up the server. (The port number used by the server can be determined by setting the `PORT` environmental variable; failing that 5000 is used.) An instance of the server is also deployed [on the cloud](https://r2epub.herokuapp.com/) at the `https://r2epub.herokuapp.com/` URL.

The documentation is also available [on-line](https://iherman.github.io/r2epub/typedoc/).

Note that the on-the-fly conversion via respec is done by running the original source through the separate `https://labs.w3.org/spec-generator/` service. Alas!, that service may be down, and this package has no control over that…

Copyright © 2020 [@iherman](https://github.com/iherman).

---

<span style='font-size:80%'>Several years ago I have already made a similar program called [Respec2EPUB](https://github.com/iherman/respec2epub). That version was written in Python 2;
alas!, with the demise of Python 2 in favor of Python 3, it will become unusable soon. (E.g., latest Debian releases do not
even install Python 2 any more.) Instead of fighting through the 2->3 conversion, I decided to re-write the program, making it way
simpler along the way (due to the stabilization of the W3C TR styles). The result also passes the latest release of <a href='https://github.com/w3c/epubcheck'>epubcheck</a>.</span>
