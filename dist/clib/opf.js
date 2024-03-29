"use strict";
/**
 * ## Collection OPF file
 *
 * Creation of the Package file for a collection, per the [EPUB 3.3 Package Document Specification](https://www.w3.org/TR/epub-33/#sec-package-doc).
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_opf = void 0;
/**
 *
 */
const opf = require("../lib/opf");
const common = require("../lib/common");
const chapter_1 = require("./chapter");
/**
 * Creation of the of the Package file for a collection, per the [EPUB 3.3 Package Document Specification](https://www.w3.org/TR/epub-33/#sec-package-doc). See also [the `PackageWrapper` documentation](https://iherman.github.io/r2epub/typedoc/classes/_lib_opf_.packagewrapper.html).
 *
 * The method
 *
 * 1. Stores the stable files like title and nav in the package;
 * 2. Collects the dates and editors from the book and adds that to the package;
 * 3. Collects the manifest item data for each package and adds it to the new package;
 * 4. Adds the manifest items, the linear spine items, and the collections.
 * 5. Adds the non-linear spine items.
 * 6. Sets the wcag conformance if all chapters are conform
 *
 * Note that the internal structure of the final book, reflected in the modified manifest items, means putting each chapter into its own subdirectory, named after the chapter’s short name.
 *
 * @param book - the final book data
 * @returns - the Package file in textual format
 */
function create_opf(book) {
    // Create the OPF file
    // The identifier of the final publication cannot be a URL, unfortunately. For the time being
    // some sort of a unique id is used, but that should be thought through at some point...
    const the_opf = new opf.PackageWrapper(`urn:w3c:tr:${book.name}`, book.title);
    // 1. editors should be collected from the chapters; this was done when initializing the book
    the_opf.add_creators(book.editors);
    // 2. Set the date of this book
    the_opf.add_dates(book.date);
    // 3. add the fix values to the manifest, namely the title, cover, and the navigation file
    the_opf.add_manifest_item({
        "@href": "title.xhtml",
        "@id": "title_page",
        "@media-type": common.media_types.xhtml,
    });
    the_opf.add_manifest_item({
        "@href": "cover_image.svg",
        "@id": "cover",
        "@media-type": common.media_types.svg,
        "@properties": "cover-image",
    });
    the_opf.add_manifest_item({
        "@href": "nav.xhtml",
        "@id": "nav",
        "@media-type": common.media_types.xhtml,
        "@properties": "nav",
    });
    // 4. the manifest data must be collected from the chapters and added to the opf file.
    // The 'overview' files are added to the spine on the fly
    book.chapters.forEach((chapter) => {
        // unique ID-s must be added to the items themselves
        const new_collection = {
            "@role": "https://www.w3.org/TR/",
            "metadata": {
                "dc:identifier": chapter.identifier,
                "dc:title": chapter.title,
                "dc:language": "en-US",
            },
            "link": [],
        };
        chapter.opf_items.forEach((item) => {
            let id;
            // The cover images should not be considered, those are unused on the collection level
            if (item.properties === 'cover-image')
                return;
            // See if this is one of the main content items, i.e., Overview.xhtml
            if (item.href.endsWith('Overview.xhtml')) {
                // Yep, this is a main item.
                // The very first has a special id; this is due to the fact that, in the
                // `r2epub` module, the spine is a fixed content that sets the id for the Overview.xhtml file
                // and we rely on that OPF wrapper.
                if (chapter.first_chapter) {
                    id = 'main';
                }
                else {
                    id = chapter.name;
                    the_opf.add_spine_item(id);
                }
            }
            else {
                id = `${chapter.name}_${item.id}`;
            }
            the_opf.add_manifest_item({
                "@href": item.href,
                "@id": id,
                "@media-type": item.media_type,
                "@properties": item.properties,
            });
            if (!chapter_1.transfer_once.includes(item.href))
                new_collection.link.push({ "@href": item.href });
        });
        the_opf.add_collection(new_collection);
    });
    // 5. the extra (non-linear) spine data must be collected from the chapters and added to the opf file (to the end of the spine)
    book.chapters.forEach((chapter) => {
        chapter.non_linear_spine_items.forEach((itemref) => {
            the_opf.add_spine_item(`${chapter.name}_${itemref}`, true);
        });
    });
    // 6. the wcag conformance information must be gathered
    const conformance = book.chapters.reduce((previous, current) => previous && current.wcag_conforms, true);
    if (conformance)
        the_opf.add_wcag_link();
    return the_opf.serialize();
}
exports.create_opf = create_opf;
//# sourceMappingURL=opf.js.map