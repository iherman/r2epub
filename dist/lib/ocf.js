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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const constants = __importStar(require("./constants"));
const JSZip = require("jszip");
/**
 * The content of the required `container.xml` file (see the [EPUB 3.2 specification](https://www.w3.org/publishing/epub32/epub-ocf.html#sec-container-metainf-container.xml)). The root is set to `package.opf` at the top level
 */
const container_xml = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="package.opf" media-type="application/oebps-package+xml" />
    </rootfiles>
</container>
`;
/**
 * ## The class representing the EPUB 3.2 OCF package.
 *
 * Simple wrapper around the [JSZip](https://stuk.github.io/jszip/) package to create an OCF specific packaging for EPUB. The constructor generates and adds the required content files, as described in the [EPUB Specification](https://www.w3.org/publishing/epub32/epub-ocf.html#sec-container-metainf-container.xml), namely:
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
     * @param name the file name of the final package
     */
    constructor(name) {
        this.content = null;
        this._book = new JSZip();
        this.name = name;
        this._book.file('mimetype', constants.media_types.epub, { compression: 'STORE' });
        this._book.file('META-INF/container.xml', container_xml, { compression: 'STORE' });
    }
    /**
     * Store a compressed content in the OCF file. The input can be a simple text or a Stream
     * (the relevant `archiver` function takes care of disambiguation).
     *
     * @param content - Content to be stored
     * @param path_name - Path name of the file for the content
     */
    append(content, path_name) {
        this._book.file(path_name, content, { compression: 'DEFLATE' });
    }
    /** This may be temporary once the final format of usage becomes clear... */
    get book() {
        return this._book;
    }
    /**
     * Return the final content of the book all packed up.
     * If not yet done, the content is generated using the relevant jszip function, packaging all content that has been added.
     *
     * @async
     */
    async get_content() {
        if (this.content === null) {
            this.content = await this._book.generateAsync({
                type: constants.is_browser ? 'blob' : 'nodebuffer',
                mimeType: constants.media_types.epub,
                compressionOptions: {
                    level: 9
                }
            });
        }
        return this.content;
    }
}
exports.OCF = OCF;
;
//# sourceMappingURL=ocf.js.map