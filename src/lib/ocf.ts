import * as constants  from './constants';
import * as stream from 'stream';
import JSZip = require('jszip');



/**
 * The content of the required `container.xml` file (see the [EPUB 3.2 specification](https://www.w3.org/publishing/epub32/epub-ocf.html#sec-container-metainf-container.xml)). The root is set to `package.opf` at the top level
 */
const container_xml :string = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="package.opf" media-type="application/oebps-package+xml" />
    </rootfiles>
</container>
`

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
export class OCF {
    private _book    :JSZip;
    name    :string;
    private content :Buffer|Blob = null;

    /**
     *
     * @param name the file name of the final package
     */
    constructor(name :string) {
        this._book = new JSZip();
        this.name = name;

        this._book.file('mimetype', constants.media_types.epub, {compression: 'STORE'});
        this._book.file('META-INF/container.xml', container_xml, {compression: 'STORE'})
    }

    /**
     * Store a compressed content in the OCF file. The input can be a simple text or a Stream
     * (the relevant `archiver` function takes care of disambiguation).
     *
     * @param content - Content to be stored
     * @param path_name - Path name of the file for the content
     */
    append(content :string|stream.Readable, path_name: string): void {
        this._book.file(path_name, content, {compression: 'DEFLATE'});
    }

    /** This may be temporary once the final format of usage becomes clear... */
    get book() :JSZip {
        return this._book;
    }

    /**
     * Return the final content of the book all packed up.
     * If not yet done, the content is generated using the relevant jszip function, packaging all content that has been added.
     *
     * @async
     */
    async get_content() :Promise<Buffer|Blob> {
        if (this.content === null) {
            this.content = await this._book.generateAsync({
                type:  constants.is_browser ? 'blob' : 'nodebuffer',
                mimeType: constants.media_types.epub,
                compressionOptions: {
                    level: 9
                }
            });
       }
        return this.content;
    }
};
