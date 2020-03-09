/**
 * Wrapper around the package
 */
import { convert } from "xmlbuilder2";

interface ManifestItem {
    "@href"           :string,
    "@id"             :string,
    "@media-type"     :string,
    "@properties"?    :string,
    "@media-overlay"? :string
}

interface Manifest {
    "item" : ManifestItem[]
}

interface DCIdentifier {
    "@id"? :string,
    "#"    :string
}

interface DCTitle {
    "@id"?       :string,
    "@dir"?      :string,
    "@xml:lang"? :string,
    "#"          :string
}

interface DCLang {
    "@id"? :string,
    "#"    :string
}

interface Meta {
    "@property"  :string
    "@id"?       :string,
    "@dir"?      :string,
    "@refines"?  :string,
    "@scheme"?   :string,
    "@xml:lang"? :string,
    "#"?         :string
}

interface Link {
    "@rel"         :string,
    "@href"        :string,
    "@id"?         :string,
    "@media-type"? :string,
    "@properties"? :string,
    "@refines"?    :string,
}

interface Creator {
    "@id"?   :string,
    "@role"? :string,
    "#"      :string
}

interface Metadata {
    "dc:identifier"    :DCIdentifier[],
    "dc:title"         :DCTitle[],
    "dc:language"      :DCLang[],
    "meta"             :Meta[],
    "link"?            :Link[],
    "dc:creator"?      :Creator[],
    [propName: string] :any;
}

interface Spine {
    itemref: SpineItemRef[]
}

interface SpineItemRef {
    "@idref"       :string,
    "@id"?         :string,
    "@linear"?     :boolean,
    "@properties"? :string
}

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

interface Package {
    "package" :PackageContent
}

/**
 * Wrapper around the internal representation of a EPUB3 Package document, as defined in the [EPUB Packages 3.2 Specification](https://www.w3.org/publishing/epub32/epub-packages.html#sec-package-doc).
 *
 * The types and default values do not reflect all possibilities of Package documents, only those that are relevant for W3C Technical reports.
 */
export class PackageWrapper {
    /** The Package document content itself, stored in a JSON object for an easier manipulation */
    thePackage: Package;

    /**
     * @param identifier - Canonical identifier of the publication, used in the `dc:identifier` metadata entry
     * @param title - Title of the publication
     */
    constructor(identifier :string, title :string) {
        this.thePackage = {
            "package": {
                "@xmlns" : "http://www.idpf.org/2007/opf",
                "@xmlns:dc": "http://purl.org/dc/elements/1.1/",
                "@prefix" : "cc: http://creativecommons.org/ns#",
                "@unique-identifier" : "pub-id",
                "@version": "3.0",
                "@xml:lang": "en-us",
                metadata: {
                    "dc:identifier": [{
                        "#" : identifier,
                        "@id": "pub-id"
                    }],
                    "dc:title": [{
                        "@id" : "title",
                        "#" : title
                    }],
                    "dc:language": [{
                        "#": "en-us"
                    }],
                    "meta": [{
                        "@property": "title-type",
                        "@refines": "#title",
                        "#": "main"
                    },{
                        "@property": "cc:attributionURL",
                        "#": "https://www.w3.org"
                    }],
                    "dc:rights": "https://www.w3.org/Consortium/Legal/2015/doc-license",
                    "dc:publisher": "World Wide Web Consortium",
                    "link" : [{
                        "@href": "https://www.w3.org/Consortium/Legal/2015/doc-license",
                        "@rel": "cc:license"
                    }],
                    "dc:creator": []
                },
                manifest : {
                    "item" : [
                        {
                            "@href": "nav.xhtml",
                            "@media-type":"application/xhtml+xml",
                            "@properties":"nav",
                            "@id": "nav",
                        },
                        // {
                        //     "@href": "toc.ncx",
                        //     "@id": "ncx",
                        //     "@media-type":"application/x-dtbncx+xml"
                        // },
                        {
                            "@href": "cover.xhtml",
                            "@media-type": "application/xhtml+xml",
                            "@id": "start",
                        },
                        {
                            "@href": "Overview.xhtml",
                            "@media-type": "application/xhtml+xml",
                            "@id": "main",
                        }
                    ]
                },
                spine : {
                    "itemref" : [
                        {
                            "@idref": "start",
                        },
                        {
                            "@idref": "main",
                        }
                    ]
                }
            }
        }
    }

    /**
     * Add a manifest item, i.e., the reference to a resource that is part of the publication
     *
     * @param item - manifest item, as defined in the [EPUB Packages specification](https://www.w3.org/publishing/epub32/epub-packages.html#sec-item-elem)
     */
    add_manifest_item(item :ManifestItem) :void {
        this.thePackage.package.manifest.item.push(item);
    }

    /**
     * Add a list of creators (authors) to the publication.
     *
     * @param creators - list of creators of the publications
     */
    add_creators(creators: string[]): void {
        creators.forEach((creator: string) => {
            this.thePackage.package.metadata["dc:creator"].push({
                "@role": "author",
                "#": creator
            });
        });
    }

    /**
     * Set the date and the modification date of the publication.
     *
     * @param date - modification date and proper date (there is no difference for W3C Documents)
     */
    add_dates(date :string): void {
        this.thePackage.package.metadata.meta.push({
            "@property": "dcterms:date",
            "#": date
        });
        this.thePackage.package.metadata.meta.push({
            "@property": "dcterms:modified",
            "#": date
        })
    }

    /**
     * Serialize the Package document into (pretty printed) XML
     *
     * @returns - Pretty printed XML
     */
    serialize(): string {
        return convert({encoding: "utf-8"}, this.thePackage, {prettyPrint: true}) as string;
    }
}

