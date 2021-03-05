"use strict";
/**
 * ## Collection cover image
 *
 * Creation of a cover image for a collection. See [[create_cover_image]] for the details.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_cover_image = void 0;
const utils = require("../lib/utils");
const cover_1 = require("../lib/cover");
/**
 * Create the cover image: it is an SVG file with title (as defined in the JSON configuration), date, and a W3C Logo.
 *
 * @param book - the full book data
 * @returns a text representation of the cover svg file.
 */
function create_cover_image(book) {
    return cover_1.cover_svg
        .replace('%%%TITLE%%%', utils.slice_text(book.title))
        .replace('%%%SUBTITLE%%%', utils.date_to_string(book.date));
}
exports.create_cover_image = create_cover_image;
//# sourceMappingURL=cover.js.map