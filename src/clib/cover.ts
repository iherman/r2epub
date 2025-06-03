/**
 * ## Collection cover image
 *
 * Creation of a cover image for a collection. See [[create_cover_image]] for the details.
 *
 * @packageDocumentation
 */

import type * as cConvert from './convert.ts';
import * as utils         from '../lib/utils.ts';
import { cover_svg }      from '../lib/cover.ts';


/**
 * Create the cover image: it is an SVG file with title (as defined in the JSON configuration), date, and a W3C Logo.
 *
 * @param book - the full book data
 * @returns a text representation of the cover svg file.
 */
export function create_cover_image(book :cConvert.Collection) :string {
    return cover_svg
        .replace('%%%TITLE%%%', utils.slice_text(book.title))
        .replace('%%%SUBTITLE%%%', utils.date_to_string(book.date || ''));
}
