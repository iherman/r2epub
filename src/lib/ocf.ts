/**
 * ## OCF Package
 *
 * Simple wrapper around the [JSZip](https://stuk.github.io/jszip/) package to create an OCF specific packaging for EPUB.
 *
 * The core of the module is in the [[OCF]] class.
 *
 * @packageDocumentation
 */
import * as fs     from 'fs';
import * as stream from 'stream';
import JSZip       from 'jszip';

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
 * EPUB 3.2 OCF package.
 *
 * The constructor generates and adds the required content files, as described in the [EPUB Specification](https://www.w3.org/publishing/epub32/epub-ocf.html#sec-container-metainf-container.xml), namely:
 *
 * * The `mimetype` file
 * * The `container.xml` file, see the value in [[container_xml]].
 *
 * Both of these files are stored uncompressed.
 *
 */
export class OCF {
    private book: JSZip;
    private name: string;

    /**
     *
     * @param name the file name of the final package
     */
    constructor(name: string) {
        this.book = new JSZip();
        this.name = name;

        this.book.file('mimetype', 'application/epub+zip', {compression: 'STORE'});
        this.book.file('META-INF/container.xml', container_xml, {compression: 'STORE'})
    }

    /**
     * Store a compressed content in the OCF file. The input can be a simple text or a Stream
     * (the relevant `archiver` function takes care of disambiguation).
     *
     * @param content - Content to be stored
     * @param path_name - Path name of the file for the content
     */
    append(content: string|stream.Readable, path_name: string): void {
        this.book.file(path_name, content, {compression: 'DEFLATE'});
    }

    /**
     * Finalize, a.k.a. close the OCF file. This creates the final file on the file system.
     *
     * @async
     */
    async finalize(): Promise<any> {
        const blob = await this.book.generateAsync({
            type: 'nodebuffer',
            mimeType: 'application/epub+zip',
            compressionOptions: {
                level: 9
            }
        });
        fs.writeFileSync(this.name, blob);
        return;
    }
};
