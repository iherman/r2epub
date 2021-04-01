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

/**
 *
 *
 */

import { convert }   from "xmlbuilder2";
import * as utils    from "./utils";

// These are just the encodings, per xmlbuilder, of the various items as defined for the EPUB 3.2 package. See that document for details.
/**
 *
 */
interface DCIdentifier {
    "@id"? :string,
    "#" :string
}

/**
 *
 */
interface DCTitle {
    "@id"? :string,
    "@dir"? :string,
    "@xml:lang"? :string,
    "#" :string
}

/**
 *
 */
interface DCLang {
    "@id"? :string,
    "#" :string
}

/**
 * The "meta" element content, as defined in the spec.
 */
interface Meta {
    "@property" :string
    "@id"? :string,
    "@dir"? :string,
    "@refines"? :string,
    "@scheme"? :string,
    "@xml:lang"? :string,
    "#"? :string
}

/**
 * The "link" element content, as define in the spec. `@rel` is optional, because it is also used for OPF collections, and
 * `@rel` is indeed optional in that context.
 */
export interface Link {
    "@rel"? :string,
    "@href" :string,
    "@id"? :string,
    "@media-type"? :string,
    "@properties"? :string,
    "@refines"? :string,
}

/**
 *
 */
interface Creator {
    "@id"? :string,
    "@role"? :string,
    "#" :string
}

/**
 * The minimal metadata, used by the TR documents.
 */
interface Metadata {
    "dc:identifier" :DCIdentifier[],
    "dc:title" :DCTitle[],
    "dc:language" :DCLang[],
    "meta" :Meta[],
    "link"? :Link[],
    "dc:creator"? :Creator[],
    [propName: string] :any;
}

/**
 *
 */
export interface ManifestItem {
    "@href" :string,
    "@id" :string,
    "@media-type" :string,
    "@properties"? :string,
    "@media-overlay"? :string,
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
    "@idref" :string,
    "@id"? :string,
    "@linear"? :string,
    "@properties"? :string
}

/**
 * Representation of the "spine" element.
 */
interface Spine {
    itemref: SpineItem[]
}

/**
 * The minimal metadata, used in collections
 */
export interface CollectionMetadata {
    "dc:identifier" :string,
    "dc:title" :string,
    "dc:language" :string,
}

/**
 * Representations of the "collections" element
 */
export interface Collection {
    "@role" :string,
    "metadata"? :CollectionMetadata,
    "link" :Link[]
}

/**
 * Encoding of the XML structure of the package file, as defined in the EPUB specification, in JSON.
 */
interface PackageContent {
    "@xmlns" :string,
    "@unique-identifier" :string,
    "@version" :string,
    "@xmlns:dc" :string,
    "@prefix"? :string,
    "@dir"? :string,
    "@id"? :string,
    "@xml:lang"? :string,
    "metadata" :Metadata,
    "manifest" :Manifest,
    "spine" :Spine,
    "collection"? :Collection[]
}

/**
 * Encoding of the XML structure of the package file in JSON; simply a wrapper around [[PackageContent]].
 *
 * (Strictly speaking, from a Typescript point of view, this is interface would not be necessary; however, by defining it this way the XML representation can be easily generated.)
 */
export interface Package {
    "package" :PackageContent
}

/**
 * ## The OPF Wrapper
 *
 * Wrapper around the internal representation of a EPUB3 Package document, as defined in the [EPUB Packages 3.2 Specification](https://www.w3.org/publishing/epub32/epub-packages.html#sec-package-doc)
 *
 * The module relies on the [`xmlbuilder2` package](https://oozcitak.github.io/xmlbuilder2/), which generates an XML file out of a set of JS objects. See the documentation of that library for
 * the details; the short overview is:
 *
 * - JSON names starting with `"@""` represent an attribute.
 * - JSON name `"#""` represent textual content of the element.
 * - Otherwise a JSON name refers to an embedded dictionary representing a subelement in XML.
 *
 * The type hierarchy to represent an OPF file through such objects is defined through [[Package]]. Those types and default values do not reflect all possibilities of Package documents, only those that are relevant for W3C Technical reports.
 *
 */
export class PackageWrapper {
    /** The Package document content itself, stored in a JSON object for an easier manipulation
     * @hidden
     */
    private thePackage: Package;

    /** Id generated to the editors for cross reference
     * @hidden
     */
    private id = 0;

    /**
     * @param identifier - Canonical identifier of the publication, used in the `dc:identifier` metadata entry
     * @param title - Title of the publication
     */
    // eslint-disable-next-line max-lines-per-function
    constructor(identifier :string, title :string) {
        this.thePackage = {
            package : {
                "@xmlns"             : "http://www.idpf.org/2007/opf",
                "@xmlns:dc"          : "http://purl.org/dc/elements/1.1/",
                "@prefix"            : "cc: http://creativecommons.org/ns#",
                "@unique-identifier" : "pub-id",
                "@version"           : "3.0",
                "@xml:lang"          : "en-us",
                metadata             : {
                    "dc:identifier" : [{
                        "#"   : identifier,
                        "@id" : "pub-id",
                    }],
                    "dc:title" : [{
                        "@id" : "title",
                        "#"   : utils.de_xml(title),
                    }],
                    "dc:language" : [{
                        "#" : "en-us",
                    }],
                    "dc:subject" : [{
                        "@id" : "acm1",
                        "#"   : "Information systems~World Wide Web",
                    },{
                        "@id" : "acm2",
                        "#"   : "General and reference~Computing standards, RFCs and guidelines",
                    }],
                    "meta" : [{
                        "@property" : "title-type",
                        "@refines"  : "#title",
                        "#"         : "main",
                    },{
                        "@property" : "cc:attributionURL",
                        "#"         : "https://www.w3.org",
                    },{
                        "@property" : "authority",
                        "@refines"  : "#acm1",
                        "#"         : "https://dl.acm.org/ccs",
                    },{
                        "@property" : "term",
                        "@refines"  : "#acm1",
                        "#"         : "10002951.10003260",
                    },{
                        "@property" : "authority",
                        "@refines"  : "#acm2",
                        "#"         : "https://dl.acm.org/ccs",
                    },{
                        "@property" : "term",
                        "@refines"  : "#acm2",
                        "#"         : "10002944.10011122.10003459",
                    },{
                        "@property" : "schema:accessibilityFeature",
                        '#'         : "tableOfContents",
                    },{
                        "@property" : "schema:accessibilityFeature",
                        '#'         : "readingOrder",
                    },{
                        "@property" : "schema:accessibilityHazard",
                        '#'         : "none",
                    },{
                        "@property" : "schema:accessMode",
                        '#'         : "textual",
                    },{
                        "@property" : "schema:accessModeSufficient",
                        '#'         : "textual",
                    },{
                        "@property" : "schema:accessibilitySummary",
                        '#'         : "Visual elements have captions and alternate descriptions. They are always non-normative and used for illustrative purposes only.",
                    },{
                        '@property' : "a11:certifiedBy",
                        '#'         : "World Wide Web Consortium",
                    }],
                    "dc:rights"    : "https://www.w3.org/Consortium/Legal/2015/doc-license",
                    "dc:publisher" : "World Wide Web Consortium",
                    "link"         : [{
                        "@href" : "https://www.w3.org/Consortium/Legal/2015/doc-license",
                        "@rel"  : "cc:license",
                    }],
                    "dc:creator" : [],
                },
                manifest : {
                    "item" : [],
                },
                spine : {
                    "itemref" : [
                        {
                            "@idref" : "title_page",
                        },
                        {
                            "@idref" : "nav",
                        },
                        {
                            "@idref" : "main",
                        },
                    ],
                },
            },
        }
    }

    /**
     * Add a manifest item, i.e., the reference to a resource that is part of the publication.
     *
     * @param item - manifest item, as defined in the [EPUB Packages specification](https://www.w3.org/publishing/epub32/epub-packages.html#sec-item-elem)
     * @add_spine_item - whether the item must be added to the spine, too (with a `linear=no` attribute value)
     */
    add_manifest_item(item :ManifestItem, add_spine_item = false) :void {
        if (item['@properties'] === undefined || item['@properties'] === '') {
            delete item['@properties'];
        }
        this.thePackage.package.manifest.item.push(item);
        if (add_spine_item) {
            this.thePackage.package.spine.itemref.push({
                '@idref'  : item['@id'],
                '@linear' : 'no',
            })
        }
    }

    /**
     * Add an A11y link to WCAG A, to specify that the document conforms to this level
     *
     */
    add_wcag_link() :void {
        this.thePackage.package.metadata["link"].push({
            "@rel"  : 'dcterms:conformsTo',
            '@href' : 'http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-a',
        })
    }

    /**
     * Add a spine item, i.e., the reference to the resource in the manifest that is a constituent of the spite (i.e., reading order) of the book
     *
     * @param idref - the reference that must be added to the spine item
     * @param linear - if the 'linear = no' flag should be added
     */
    add_spine_item(idref :string, add_linear = false) :void {
        const item :SpineItem = {
            '@idref' : idref,
        };
        if (add_linear) {
            item['@linear'] = 'no';
        }
        this.thePackage.package.spine.itemref.push(item);
    }

    /**
     * Add a list of creators (authors) to the publication.
     *
     * @param creators - list of creators of the publications
     */
    add_creators(creators :string[]): void {
        creators.forEach((creator: string) => {
            this.thePackage.package.metadata["dc:creator"].push({
                "@id" : `creator_id_${this.id}`,
                "#"   : creator,
            });
            this.thePackage.package.metadata["meta"].push({
                "@refines"  : `#creator_id_${this.id}`,
                "@property" : "role",
                "@scheme"   : "marc:relators",
                "#"         : "edt",
            });
            this.id += 1;
        });
    }

    /**
     * Add a new OPF collection. This is used when the final EPUB is itself a collection of parts; each collection in the
     * OPF sense collects the constituents of a specific part.
     *
     * @param new_collection a new collection to be added to the package document.
     */
    add_collection(new_collection :Collection): void {
        if (this.thePackage.package.collection === undefined) {
            this.thePackage.package.collection = [new_collection];
        } else {
            this.thePackage.package.collection.push(new_collection);
        }
    }

    /**
     * Set the date and the modification date of the publication.
     *
     * @param date - modification date and proper date (there is no difference for W3C Documents)
     */
    add_dates(date :string): void {
        this.thePackage.package.metadata.meta.push({
            "@property" : "dcterms:date",
            "#"         : `${date}T00:00:00Z`,
        });
        this.thePackage.package.metadata.meta.push({
            "@property" : "dcterms:modified",
            "#"         : `${date}T00:00:00Z`,
        });
        this.thePackage.package.metadata.meta.push({
            "@property" : "dcterms:dateCopyrighted",
            "#"         : `${date.split('-')[0]}`,
        })
    }

    /**
     * Add accessibility feature strings to the metadata
     *
     * @param features list of feature strings
     */
    add_a11y_feature(features: string[]): void {
        for (const feature of features) {
            this.thePackage.package.metadata.meta.push({
                "@property" : "schema:accessibilityFeature",
                "#"         : `${feature}`,
            })
        }
    }

    /**
     * Serialize the Package document into (pretty printed) XML.
     *
     * @returns - Pretty printed XML
     */
    serialize(): string {
        return convert({encoding: "utf-8"}, this.thePackage, {prettyPrint: true}) as string;
    }
}
