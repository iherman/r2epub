"use strict";
/**
 * ## OCF Package
 *
 * Simple wrapper around the [JSZip](https://stuk.github.io/jszip/) package to create an OCF specific packaging for EPUB.
 *
 * The core of the module is in the [[OCF]] class.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCF = void 0;
/**
 *
 */
const common = require("./common");
const JSZip = require("jszip");
/**
 * The content of the required `container.xml` file (see the [EPUB 3.3 specification](https://www.w3.org/TR/epub-33/#sec-container-metainf-container.xml)). The root is set to `package.opf` at the top level
 */
const container_xml = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="package.opf" media-type="application/oebps-package+xml" />
    </rootfiles>
</container>
`;
/**
 * ## The class representing the EPUB 3.3 OCF package.
 *
 * Simple wrapper around the [JSZip](https://stuk.github.io/jszip/) package to create an OCF specific packaging for EPUB. The constructor generates and adds the required content files, as described in the [EPUB Specification](https://www.w3.org/TR/epub-33/#sec-ocf), namely:
 *
 * * The `mimetype` file
 * * The `container.xml` file, see the value in [[container_xml]].
 *
 * Both of these files are stored uncompressed.
 *
 */
class OCF {
    /**
     *
     * @param name the file name of the final package. This is based on the short name of the document, or the name provided in the configuration file.
     */
    constructor(name) {
        this.content = null;
        this._container = new JSZip();
        this._name = name;
        this._container.file('mimetype', common.media_types.epub, { compression: 'STORE' });
        this._container.file('META-INF/container.xml', container_xml, { compression: 'STORE' });
    }
    /**
     * Store a compressed content in the OCF file. The input can be a simple text or a Stream
     * (the relevant `archiver` function takes care of disambiguation).
     *
     * @param content - Content to be stored
     * @param path_name - Path name of the file for the content
     */
    append(content, path_name) {
        this._container.file(path_name, content, { compression: 'DEFLATE' });
    }
    /**
     * Return the name of the final file, as provided at constructor time.
     * This is based on the short name of the document, or the name provided in the configuration file.
     */
    get name() {
        return this._name;
    }
    /**
     * Returns the underlying ZIP container; this is used when creating a "collection", ie, when the
     * the final content is generated from several zip containers.
     */
    get container() {
        return this._container;
    }
    /**
     * Return the final content of the book all packed up.
     * If not yet done, the content is generated using the relevant `jszip` function, packaging all content that has been added.
     *
     * @async
     */
    async get_content() {
        if (this.content === null) {
            this.content = await this._container.generateAsync({
                type: common.is_browser ? 'blob' : 'nodebuffer',
                mimeType: common.media_types.epub,
                compressionOptions: {
                    level: 9,
                },
            });
        }
        return this.content;
    }
}
exports.OCF = OCF;
//# sourceMappingURL=ocf.js.map