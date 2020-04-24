/**
 * ## The OPF package
 *
 * Wrapper around the package. The details of the various entries are in the
 * [EPUB Packages 3.2 Specification](https://www.w3.org/publishing/epub32/epub-packages.html#sec-package-doc).
 *
 * The module relies on the [`xmlbuilder2` package](https://oozcitak.github.io/xmlbuilder2/), which generates an XML file out of a set of JS objects. See the documentation of that library for
 * the details; the short overview is:
 *
 * - JSON names starting with `"@""` represent an attribute.
 * - JSON name `"#""` represent textual content of the element.
 * - Otherwise a JSON name refers to an embedded dictionary representing a subelement in XML.
 *
 * The core of the module is in the [[PackageWrapper]] class.
 *
 * @packageDocumentation
 */

// These are just the encodings, per xmlbuilder, of the various items as defined for the EPUB 3.2 package. See that document for details.

/**
 * @hidden
 */
export interface ManifestItem {
    "@href"           :string,
    "@id"             :string,
    "@media-type"     :string,
    "@properties"?    :string,
    "@media-overlay"? :string
}

/**
 * @hidden
 */
interface Manifest {
    "item" : ManifestItem[]
}

/**
 * @hidden
 */
interface DCIdentifier {
    "@id"? :string,
    "#"    :string
}

/**
 * @hidden
 */
interface DCTitle {
    "@id"?       :string,
    "@dir"?      :string,
    "@xml:lang"? :string,
    "#"          :string
}

/**
 * @hidden
 */
interface DCLang {
    "@id"? :string,
    "#"    :string
}

/**
 * @hidden
 */
interface Meta {
    "@property"  :string
    "@id"?       :string,
    "@dir"?      :string,
    "@refines"?  :string,
    "@scheme"?   :string,
    "@xml:lang"? :string,
    "#"?         :string
}

/**
 * @hidden
 */
interface Link {
    "@rel"         :string,
    "@href"        :string,
    "@id"?         :string,
    "@media-type"? :string,
    "@properties"? :string,
    "@refines"?    :string,
}

/**
 * @hidden
 */
interface Creator {
    "@id"?   :string,
    "@role"? :string,
    "#"      :string
}

/**
 * @hidden
 */
interface Metadata {
    "dc:identifier"    :DCIdentifier[],
    "dc:title"         :DCTitle[],
    "dc:language"      :DCLang[],
    "meta"             :Meta[],
    "link"?            :Link[],
    "dc:creator"?      :Creator[],
    [propName: string] :any;
}

/**
 * @hidden
 */
interface Spine {
    itemref: SpineItemRef[]
}

/**
 * @hidden
 */
interface SpineItemRef {
    "@idref"       :string,
    "@id"?         :string,
    "@linear"?     :boolean,
    "@properties"? :string
}

/**
 * @hidden
 */
interface PackageContent {
    "@xmlns"             :string,
    "@unique-identifier" :string,
    "@version"           :string,
    "@xmlns:dc"          :string,
    "@prefix"?           :string,
    "@dir"?              :string,
    "@id"?               :string,
    "@xml:lang"?         :string,
    "metadata"           :Metadata,
    "manifest"           :Manifest,
    "spine"              :Spine
}

/**
 * Encoding of the XML structure of the package file, as defined in the EPUB specification, in JSON.
 */
export interface Package {
    "package" :PackageContent
}

