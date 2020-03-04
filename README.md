# Respec to EPUB

Typescript program to assist in turning W3C documents, produced by [ReSpec](https://github.com/w3c/respec), to EPUB. The script does **not** aim at being a generic HTML->EPUB solution, it is indeed tailored at W3C TR documents based on ReSpec.

Several years ago I have already made a program like that, called [Respec2EPUB](https://github.com/iherman/respec2epub). The main problem with that version is that it was written in Python 2; alas!, with the demise of Python 2 in favor of Python 3, that module will become unusable soon. (E.g., latest Debian releases do not even install Python 2 any more.) Converting that code from Python 2 to Python 3 is a non-negligible work, and I decided to re-write the code in Typescript instead because:

- Respec2EPUB was written at a time when the W3C TR documents changed style. It was a transition period, and the script was prepared to both "old-skool" and new document styles. This, obviously, made the code a bit messy here and there. Better get rid of it.
- Combining the code with ReSpec (written in Javascript) is messy; it can be expected that combining with Typescript...

**At this moment, this project is at its very beginning.** Just bits and pieces of code, as it develops. Because this is a, sort of, side project, no quick progress should be expected...
