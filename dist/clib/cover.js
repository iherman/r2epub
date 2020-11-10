"use strict";
/**
 * ## Collection cover image
 *
 * Creation of a cover image for a collection. See [[create_cover_image]] for the details.
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_cover_image = void 0;
const utils = __importStar(require("../lib/utils"));
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