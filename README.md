# ReSpec to EPUB

Typescript program to convert W3C documents, produced by [ReSpec](https://github.com/w3c/respec), to EPUB 3.2.

If used from another program, the main entry point are the [[create_epub]] and [[create_epub_from_dom]] functions, which create the EPUB 3.2 file by submitting a URL and some flags, or the URL and a DOM instance, respectively.
There is also a simple CLI implemented in [[main]] which works as follows:

```text
Options:
  --help                 Show help  [boolean]
  -r, --respec           The source is in respec  [boolean] [default: false]
  -d, --publishDate      Publication date  [string] [default: null]
  -s, --specStatus       Specification type [string] [default: null]
  -l, --addSectionLinks  Add section links with "§"  [string] [default: null]
  -m, --maxTocLevel      Max TOC level [number] [default: null]
```

For the `-d`, `-s`, `-l`, or `-m` flags, see the [ReSpec manual](https://www.w3.org/respec/). These flags are only operational if the `-r` flag is also set.

The documentation is also available [on-line](https://iherman.github.io/respec-to-epub/).

## Implementation specificities

The implementation is in Typescript and on top of `node.js`. The project can be downloaded via cloning and can be installed via a standard `npm` processing.

---

Several years ago I have already made a similar program called [Respec2EPUB](https://github.com/iherman/respec2epub). That version is that it was written in Python 2; alas!, with the demise of Python 2 in favor of Python 3, that module will become unusable soon. (E.g., latest Debian releases do not even install Python 2 any more.) Instead of fighting through the 2->3 conversion, I decided to re-write the program, making it a bit simpler along the way.
