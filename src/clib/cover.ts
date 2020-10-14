/**
 * ## Collection cover image
 *
 * Creation of a title page for a collection. See [[create_title_page]] for the details.
 *
 * @packageDocumentation
 */

import * as cConvert from './convert';
import * as utils    from '../lib/utils';
import { cover_svg } from '../lib/cover';


/**
 * Create the HTML content for a title page.
 *
 * The title originates from the JSON configuration; the editors and the date are collected from the chapters.
 *
 *
 * @param book - the full book data
 * @returns a text representation of the cover svg file.
 */
export function create_cover_image(book :cConvert.Collection) :string {
    return cover_svg
        .replace('%%%TITLE%%%', utils.slice_text(book.title))
        .replace('%%%SUBTITLE%%%', utils.date_to_string(book.date));
}
