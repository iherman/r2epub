/**
 * ## OCF Package
 *
 * Simple wrapper around the [JSZip](https://stuk.github.io/jszip/) package to create an OCF specific packaging for EPUB.
 *
 * The core of the module is in the [[OCF]] class.
 *
 * @packageDocumentation
 * @module
 */

/**
 *
 */


import * as common     from './common.ts';
import * as stream     from 'node:stream';
import type { Buffer } from "node:buffer"
import JSZip           from 'jszip';

/**
 * The content of the required `container.xml` file (see the [EPUB 3.4 specification](https://www.w3.org/TR/epub-33/#sec-container-metainf-container.xml)). The root is set to `package.opf` at the top level
 */
const container_xml  = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="package.opf" media-type="application/oebps-package+xml" />
    </rootfiles>
</container>
`

/**
 * ## The class representing the EPUB 3.4 OCF package.
 *
 * Simple wrapper around the [JSZip](https://stuk.github.io/jszip/) package to create an OCF specific packaging for EPUB. The constructor generates and adds the required content files, as described in the [EPUB Specification](https://www.w3.org/TR/epub-33/#sec-ocf), namely:
 *
 * * The `mimetype` file
 * * The `container.xml` file, see the value in [[container_xml]].
 *
 * Both of these files are stored uncompressed.
 *
 */
export class OCF {
    private _container :JSZip;
    private _name :string;
    private content :Buffer | ArrayBuffer | null = null;

    /**
     *
     * @param name the file name of the final package. This is based on the short name of the document, or the name provided in the configuration file.
     */
    constructor(name :string) {
        this._container = new JSZip();
        this._name = name;

        this._container.file('mimetype', common.media_types.epub, {compression: 'STORE'});
        this._container.file('META-INF/container.xml', container_xml, {compression: 'STORE'})
    }

    /**
     * Store a compressed content in the OCF file. The input can be a simple text or a Stream
     * (the relevant `archiver` function takes care of disambiguation).
     *
     * @param content - Content to be stored
     * @param path_name - Path name of the file for the content
     */
    append(content :string|ArrayBuffer|Blob|stream.Readable, path_name: string, trace = false): void {
        if (trace) {
            let message = `- Appending resource (${path_name}) to OCF package`;
            if (content instanceof stream.Readable) {
                message += ` (stream)`;
            } else if (content instanceof ArrayBuffer) {
                message += ` (array buffer)`;
            } else if (typeof content === 'string') {
                message += ` (string)`;
            } else {
                message += ` (unknown type)`;
            }
            console.log(message);
        }
        this._container.file(path_name, content, {compression: 'DEFLATE'});
    }

    /**
     * Return the name of the final file, as provided at constructor time.
     * This is based on the short name of the document, or the name provided in the configuration file.
     */
    get name() :string {
        return this._name;
    }

    /**
     * Returns the underlying ZIP container; this is used when creating a "collection", ie, when the
     * the final content is generated from several zip containers.
     */
    get container() :JSZip {
        return this._container;
    }

    /**
     * Return the final content of the book all packed up.
     * If not yet done, the content is generated using the relevant `jszip` function, packaging all content that has been added.
     *
     * @async
     */
    async get_content() :Promise<Buffer | ArrayBuffer> {
        if (this.content === null) {
            this.content = await this._container.generateAsync({
                type               : 'arraybuffer',
                mimeType           : common.media_types.epub,
                compressionOptions : {
                    level : 9,
                },
            });
        }
        return this.content;
    }
}
