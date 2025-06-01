/* eslint-disable max-lines-per-function */
/**
 * ## CSS files (for the 2021 version of the Process)
 *
 *  Handling CSS mappings is a bit complicated because the W3C setup is not entirely consistent...
 *
 * In general, the HTML links to a style file of the sort
 * `https://www.w3.org/StyleSheets/TR/2021/W3C-{specStatus}`. These files are all very simple:
 * import a common `base.css` file and add a setting for the background image using the logo file
 * (this is, usually, the left stripe in the text).
 * The logo used with the name `https://www.w3.org/StyleSheets/TR/2021/logos/{specStatus}.svg`
 * The references to the logo files use relative URL-s, which is just fine for the EPUB version.
 * All these files
 * must be copied into the zip file, and the HTML references must be changed to their relative equivalents.
 *
 * However… the complication, from EPUB's point of view, mostly for some older or rarely used specification versions. The complications
 * may be:
 *
 * - The logo references in those CSS files may be absolute URL-s
 * - The logo references may rely on content negotiation, ie, do not spell out whether an SVG or a PNG image is used for a logo (which does not work in an EPUB content)
 * - Some basic formats do not use logo at all.
 * - The references are not relying on the `2021` subtree of the `StyleSheets/TR/` directory of the W3C site
 *
 * The function below handles the exceptional cases separately by storing some css and png files in a [fixed place](https://www.ivan-herman.net/r2epub/2021/) and copy the
 * files from there (as opposed to using the W3C files directly). This is done instead of performing some extra CSS parsing.
 *
 * Furthermore, the core `base.css` file is also modified slightly:
 *     - the TOC related statements have been removed
 *     - some page breaking instructions are added
 *     - the margins/padding of the page is set on a different HTML element, see the [separate “overview” module](./_lib_overview_.html) for further details.
 *
 * ### Small note on the SVG Logo files
 *
 * Some of the SVG files include a `<!DOCTYPE`, which leads to an error in epubcheck for EPUB 3.2. However, these are allowed in EPUB 3.3, and the errors may be safely ignored. The newer version of epubcheck accepts these
 * SVG files. (All EPUB Reading System work well with included `<!DOCTYPE`.)
 *
 * @packageDocumentation
*/

import type { ResourceRef, Global }  from './convert.ts';
import * as urlHandler          from 'url';
import * as common              from './common.ts';


/* ---------------------------------------------- Main entry point ----------------------------------------- */

/**
 * Extract/add the right CSS references and gathers all resources (logo files, watermark image, etc.) to be added to the overall set of resources in the final book. Note that the HTML DOM of the main file is modified on the fly:
 *
 * - The reference to the core CSS is changed to `base.css`.
 * - The background/watermark handling is stored in a separate, extra CSS file, whose reference is added to the document.
 *
 * @param global
 * @returns - list of extracted additional resources
 */
export function extract_css(global: Global): ResourceRef[] {
    if (global.trace === true) console.log("- Handling the 2021 version css structures")
    const retval: ResourceRef[] = [];

    /** Find the relevant CSS link in the DOM. There must be only one... */
    const the_link: Element | undefined = ((): Element|undefined => {
        const all_links: HTMLLinkElement[] =
            (global.html_element ? Array.from(global.html_element.querySelectorAll('link[rel="stylesheet"]')) : []) as HTMLLinkElement[]
        // What we want is the one owned by W3C (may be undefined!)
        return all_links.find((link: Element): boolean => {
            if (link.hasAttribute('href')) {
                const url = link.getAttribute('href');
                if (url === null) {
                    return false;
                } else {
                    // The URL must be absolute, and it must be owned by W3C
                    const parsed = urlHandler.parse(url);
                    return parsed.host === 'www.w3.org';
                }
            } else {
                return false;
            }
        });
    })()

    if (the_link !== undefined) {
        // 'base' CSS file, to be added
        retval.push({
            relative_url : `${common.local_style_files}base.css`,
            media_type   : common.media_types.css,
            absolute_url : `${common.modified_epub_files}base.css`,
        });

        const css_link :string = the_link.getAttribute('href') || '';
        const base_name :string = css_link.split('/').pop() || '';

        // In most cases some extra materials have to be retrieved: logo files, background files...
        // This is signalled by the fact that the included css file reflects the specStatus value in respec
        // In some cases this is not the case, e.g., TAG findings, member submissions...; in all those coses
        // the 'base.css' file is the only one used
        if (base_name === 'base.css') {
            the_link.setAttribute('href', `${common.local_style_files}${base_name}`);
        } else {
            // Remove the 'W3C-' string to get the logo name; that is the pattern used in the official style files
            const logo_name :string = base_name.split('-').pop() || '';
            the_link.setAttribute('href', `${common.local_style_files}${base_name}.css`);
            if (['cg-draft','bg-final','bg-draft','cg-final','W3C-UD', 'unofficial','W3C-Member-SUBM'].includes(base_name)) {
                // The original css file may include absolute URLs and the logo setup
                // seems to be problematic for RS-s, so a modified version is used;
                // I.e., the css file must be retrieved from the modified versions:
                retval.push({
                    relative_url : `${common.local_style_files}${base_name}.css`,
                    media_type   : common.media_types.css,
                    absolute_url : `${common.modified_epub_files}${base_name}.css`,
                })

                if (['cg-draft', 'W3C-UD','unofficial'].includes(base_name)) {
                    retval.push({
                        relative_url : `${common.local_style_files}logos/UD-watermark.png`,
                        media_type   : common.media_types.png,
                        absolute_url : `${common.TR_logo_files}UD-watermark.png`,
                    })
                }
                // Getting the logo in PNG format for those documents that have one referred to from their css files...
                if (['cg-draft','bg-final','bg-draft','cg-final'].includes(base_name)) {
                    retval.push({
                        relative_url : `${common.local_style_files}logos/back-${base_name}.png`,
                        media_type   : common.media_types.png,
                        absolute_url : `${common.TR_logo_files}back-${base_name}.png`,
                    })
                }
            } else {
                // This is the simple, and general, case!
                //
                // The css file must be retrieved from the W3C site
                retval.push({
                    relative_url : `${common.local_style_files}${base_name}.css`,
                    media_type   : common.media_types.css,
                    absolute_url : `${css_link}.css`,
                })

                // Get the 'logo', ie, the vertical stripe on the left
                retval.push({
                    relative_url : `${common.local_style_files}logos/${logo_name}.svg`,
                    media_type   : common.media_types.svg,
                    absolute_url : `${common.TR_logo_files}${logo_name}.svg`,
                })
            }
        }

        // An extra CSS file must be added to the mix, to take care of the EPUB specificities
        retval.push({
            relative_url : `${common.local_style_files}tr_epub.css`,
            media_type   : common.media_types.css,
            text_content : common.tr_epub_css,
        })

        // Adding the reference to the epub specific css file into the dom
        the_link.insertAdjacentHTML('afterend', `<link rel="stylesheet" href="${common.local_style_files}tr_epub.css">`)
    }
    return retval;
}
