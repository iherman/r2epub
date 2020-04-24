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

// These are just the encodings, per xmlbuilder, of the various items as defined for the EPUB 3.2 package. See that document for details.

/**
 *
 */
interface DCIdentifier {
    "@id"? :string,
    "#"    :string
}

/**
 *
 */
interface DCTitle {
    "@id"?       :string,
    "@dir"?      :string,
    "@xml:lang"? :string,
    "#"          :string
}

/**
 *
 */
interface DCLang {
    "@id"? :string,
    "#"    :string
}

/**
 * The "meta" element content, as defined in the spec.
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
 * The "link" element content, as define in the spec.
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
 *
 */
interface Creator {
    "@id"?   :string,
    "@role"? :string,
    "#"      :string
}

/**
 * The minimal metadata, used by the TR documents
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
 *
 */
export interface ManifestItem {
    "@href"           :string,
    "@id"             :string,
    "@media-type"     :string,
    "@properties"?    :string,
    "@media-overlay"? :string
}

/**
 * Representation of the "manifest" element.
 */
interface Manifest {
    "item" : ManifestItem[]
}

/**
 * A single spine item
 */
interface SpineItem {
    "@idref"       :string,
    "@id"?         :string,
    "@linear"?     :boolean,
    "@properties"? :string
}

/**
 * Representation of the "spine" element.
 */
interface Spine {
    itemref: SpineItem[]
}

/**
 * Encoding of the XML structure of the package file, as defined in the EPUB specification, in JSON.
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
 * Encoding of the XML structure of the package file in JSON; simply a wrapper around [[PackageContent]].
 *
 * (Strictly speaking, from a Typescript point of view, this is interface would not be necessary; however, by defining it this way the XML representation can be easily generated.)
 */
export interface Package {
    "package" :PackageContent
}

