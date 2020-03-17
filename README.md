# Respec to EPUB

Typescript program to assist in turning W3C documents, produced by [ReSpec](https://github.com/w3c/respec), to EPUB 3.2. (The script does **not** aim at being a generic HTML->EPUB solution, it is indeed tailored at W3C TR documents based on ReSpec.)

If used from another program, the main entry point is at the [[generate]] function, which creates the EPUB 3.2 file. There is also a simple CLI implemented in [[main]] which works as follows:

```
Options:
  --help                 Show help  [boolean]
  -r, --respec           The source is in respec  [boolean] [default: false]
  -d, --publishDate      Publication date  [string] [default: null]
  -s, --specStatus       Specification type  [string] [default: null]
  -l, --addSectionLinks  Add section links with "§"  [string] [default: null]
  -m, --maxTocLevel      Max TOC level  [number] [default: null]
```

The documentation is also available [on-line](https://iherman.github.io/respec-to-epub/).

## Implementation specificities

The implementation is in Typescript and on top of `node.js`. The project can be downloaded via cloning and and can be installed via the standard `npm` processing.


---


Several years ago I have already made a similar program called [Respec2EPUB](https://github.com/iherman/respec2epub). That version is that it was written in Python 2; alas!, with the demise of Python 2 in favor of Python 3, that module will become unusable soon. (E.g., latest Debian releases do not even install Python 2 any more.) Instead of fighting through the 2->3 conversion, I decided to re-write the program, making it a bit simpler along the way.
