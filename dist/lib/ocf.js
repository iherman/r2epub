"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ## OCF Package
 *
 * Simple wrapper around the `archiver` package to create an OCF specific packaging for EPUB.
 *
 * @packageDocumentation
 */
const fs = __importStar(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
/**
 * The content of the required `container.xml` file. The root is set to `package.opf` at the top level
 */
const container_xml = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="package.opf" media-type="application/oebps-package+xml" />
    </rootfiles>
</container>
`;
/**
 * EPUB 3.2 OCF package.
 *
 * The constructor generates and adds the required content files, as described in the [EPUB Specification](https://www.w3.org/publishing/epub32/epub-ocf.html#sec-container-metainf-container.xml), namely:
 *
 * * The `mimetype` file
 * * The `container.xml` file, see the value in [[container_xml]]
 *
 * Both of these files are stored uncompressed.
 *
 */
class OCF {
    /**
     *
     * @param name - the file name of the final package
     */
    constructor(name) {
        this.book = archiver_1.default.create('zip', { zlib: { level: 9 } });
        const output = fs.createWriteStream(name);
        this.book.pipe(output);
        this.book.append('application/epub+zip', { name: 'mimetype', store: true });
        this.book.append(container_xml, { name: 'META-INF/container.xml', store: true });
    }
    /**
     * Store a compressed content in the OCF file. The input can be a simple text or a Stream
     * (the relevant `archiver` function takes care of disambiguation).
     *
     * @param content - Content to be stored
     * @param path_name - Path name of the file for the content
     */
    append(content, path_name) {
        this.book.append(content, { name: path_name, store: false });
    }
    /**
     * Finalize, a.k.a. close the OCF file. This creates the final file on the file system.
     *
     * @async
     */
    async finalize() {
        return this.book.finalize();
    }
}
exports.OCF = OCF;
;
//# sourceMappingURL=ocf.js.map