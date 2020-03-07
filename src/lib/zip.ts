/**
 * Simple wrapper around the archiver package to create an OCF specific packaging for EPUB.
 */
import * as fs     from 'fs';
import archiver    from 'archiver';
import * as stream from 'stream';

/** The content of the required `container.xml` file. The root is set to `index.opf` at the top level */
const container_xml = `
<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="package.opf" media-type="application/oebps-package+xml" />
    </rootfiles>
</container>
`

/**
 * EPUB 3.2 OCF package.
 *
 * The constructor generates the required files, as described in the [Spec](https://www.w3.org/publishing/epub32/epub-ocf.html#sec-container-metainf-container.xml), namely:
 *
 * * The `mimetype` file
 * * The `container.xml` file, see the value in [[container_xml]]
 *
 * Both of these files are stored uncompressed.
 *
 */
export class OCF {
    private book: archiver.Archiver;

    constructor(name: string) {
        this.book = archiver.create('zip', {zlib: {level: 9}});
        const output = fs.createWriteStream(name);
        this.book.pipe(output);

        this.book.append('application/epub+zip', {name: 'mimetype', store: true});
        this.book.append(container_xml, {name: 'META-INF/container.xml', store: true});
    }

    /**
     * Store a compressed content in the OCF file
     *
     * @param content - Content to be stored
     * @param file_name - Path ame of the file for the content
     */
    append(content: string|stream.Readable, file_name: string): void {
        this.book.append(content, {name: file_name, store: false});
    }

    /**
     * Finalize, a.k.a. close the OCF file.
     *
     * @async
     */
    async finalize(): Promise<any> {
        return this.book.finalize();
    }
};
