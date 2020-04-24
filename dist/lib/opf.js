"use strict";
/**
 * ## The OPF Types
 *
 * Type hierarchy, through a set of interfaces, for the XML hierarchy defined as part of the
 * [EPUB Packages 3.2 Specification](https://www.w3.org/publishing/epub32/epub-packages.html#sec-package-doc). This makes it possible to use a simpler JS structure to represent the XML file, based on
 * the on the [`xmlbuilder2` package](https://oozcitak.github.io/xmlbuilder2/), which generates an XML file out of a set of JS objects. See the documentation of that library for
 * the details; the short overview is:
 *
 * - JSON names starting with `"@""` represent an attribute.
 * - JSON name `"#""` represent textual content of the element.
 * - Otherwise a JSON name refers to an embedded dictionary representing a subelement in XML.
 *
 * This hierarchy is used by the [[PackageWrapper]] class.
 *
 * Note that the type hierarchy to represent an OPF file through such objects is defined through [[Package]]. Those types and default values do not reflect all possibilities of Package documents, only those that are relevant for W3C Technical reports.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=opf.js.map