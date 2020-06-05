"use strict";
/**
 * ## OPF file
 *
 * Creation of the Package file, per the [EPUB Packages 3.2 Specification](https://www.w3.org/publishing/epub32/epub-packages.html#sec-package-doc).
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
const opf = __importStar(require("../lib/opf"));
const constants = __importStar(require("../lib/constants"));
/**
 * Creation of the of the Package file for a collection, per the [EPUB Packages 3.2 Specification](https://www.w3.org/publishing/epub32/epub-packages.html#sec-package-doc). See also [the `PackageWrapper` documentation](https://iherman.github.io/r2epub/typedoc/classes/_lib_opf_.packagewrapper.html).
 *
 * The method
 *
 * 1. Stores the stable files like cover and nav in the package;
 * 2. Collects the dates and editors from the book and adds that to the package;
 * 3. Collects the manifest item data for each package and adds it to the new package;
 * 4. Adds the manifest items and the linear spine items.
 * 4. Adds the non-linear spine items.
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
    // 3. add the fix values to the manifest, namely the cover and the navigation file
    the_opf.add_manifest_item({
        "@href": "cover.xhtml",
        "@id": "start",
        "@media-type": constants.media_types.xhtml
    });
    the_opf.add_manifest_item({
        "@href": "nav.xhtml",
        "@id": "nav",
        "@media-type": constants.media_types.xhtml,
        "@properties": "nav"
    });
    // 4. the manifest data must be collected from the chapters and added to the opf file.
    // The 'overview' files are added to the spine on the fly
    book.chapters.forEach((chapter) => {
        // unique ID-s must be added to the items themselves
        chapter.opf_items.forEach((item) => {
            let id;
            // See if this is one of the main content items, ie, Overview.xhtml
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
                "@properties": item.properties
            });
        });
    });
    // 5. the extra spine data must be collected from the chapters and added to the opf file
    book.chapters.forEach((chapter) => {
        chapter.non_linear_spine_items.forEach((itemref) => {
            the_opf.add_spine_item(`${chapter.name}_${itemref}`, true);
        });
    });
    return the_opf.serialize();
}
exports.create_opf = create_opf;
//# sourceMappingURL=opf.js.map