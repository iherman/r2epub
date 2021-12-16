/**
 * ## CSS files (for the 2021 version of the Process)
 *
 *  Handling CSS mappings is a bit complicated because the W3C setup is not entirely consistent...
 *
 * The general, and "usual", case is that the `specStatus` value, i.e., 'REC', 'WD', 'CR', etc,
 * means that there is a logo used with the name `https://www.w3.org/StyleSheets/TR/2016/logos/{specStatus}.svg`
 * (this is, usually, the left stripe in the text). Structurally, the HTML links to a style file of the sort
 * `https://www.w3.org/StyleSheets/TR/2016/W3C-{specStatus}`. These files are all very simple:
 * import a common `base.css` file and add a setting for the background image using the logo file. All these files
 * must be copied into the zip file, and the HTML references must be changed to their relative equivalents.
 *
 * However… the complication, from EPUB's point of view, is that
 *
 * - The logo references in those CSS files are usually absolute URL-s (but not always).
 * If the original structure was followed, the CSS file should be changed on-the-fly
 * (when put into the zip file) changing the URL reference. This would involve an extra CSS parsing.
 * - The structure described above has exceptions. Sometimes there is no such logo (e.g., for the "basic" document,
 * or the living documents), sometimes logos are shared (e.g., FPWD and WD), i.e., their name cannot simply deduced
 * from the value of `specStatus` and, in some cases, an extra trick is used to create a watermark using a
 * separate image file.
 * - The logo file URL-s rely on content negotiations to choose between SVG and PNG. This does not work for the EPUB content; SVG files are preferred.
 *
 * The approach chosen to convert the content to the EPUB file is therefore as follows:
 *
 * - The core reference in the HTML file is changed to a (stable) `base.css` file. This file is copied
 * into the EPUB file from a separate, but fixed, [URI](https://www.ivan-herman.net/r2epub/base.css)]. This is a
 * modified version of the "real" `base.css` with:
 *     - the TOC related statements have been removed
 *     - some page breaking instructions are added
 *     - the margins/padding of the page is set on a different HTML element, see the [separate “overview” module](./_lib_overview_.html) for further details.
 * - An extra css file is created, stored in the in the EPUB file and referred to from the resulting HTML file, setting
 * the right background with a relative URL. This is done by using a simple template, which is imply a copy of the
 * relevant template on the W3C site.
 *     - In some cases the template is more complex (e.g., CG or BG documents due to different logo sizes) and may also include a watermark. Luckily, the watermark is always the same file, which simplifies things somewhat.
 *
 * The easy (i.e., well structured) cases are assembled in the [[specStatus_simple]] array;
 * these can be handled automatically. The characteristics of "non-standard" cases
 * (e.g., BG/CG documents) are described in the [[specStatus_css]] object, based on the [[specStatus_css_mappings]] interface.
 *
 * @packageDocumentation
*/

/**
 *
 *
 */


import { ResourceRef, Global }  from './convert';
import * as urlHandler          from 'url';
import * as common              from './common';

/* ---------------------------------------------- CSS Templates ----------------------------------------- */


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
    /** Find the relevant CSS link in the DOM. There must be only one... */
    const css_link_element = (): Element => {
        const all_links = Array.from(global.html_element.querySelectorAll('link[rel="stylesheet"]'));
        // What we want, is the one owned by W3C (may be undefined!)
        return all_links.find((link: Element): boolean => {
            if (link.hasAttribute('href')) {
                const parsed   = urlHandler.parse(link.getAttribute('href'));
                return parsed.host === 'www.w3.org';
            } else {
                return false;
            }
        });
    }

    const retval :ResourceRef[] = [];

    const the_link :Element = css_link_element();

    if (the_link !== undefined) {
        // 'base' CSS file, to be added
        retval.push({
            relative_url : `${common.local_style_files}base.css`,
            media_type   : common.media_types.css,
            absolute_url : `${common.modified_epub_files}base.css`,
        })

        // // The html content should be modified to refer to the base directly
        // the_link.setAttribute('href', `${constants.local_style_files}base.css`);

        const css_link :string = the_link.getAttribute('href');
        const base_name :string = css_link.split('/').pop();
        const logo_name :string = base_name.split('-').pop();

        the_link.setAttribute('href', `${common.local_style_files}${base_name}.css`);

        // The css file must be retrieved
        retval.push({
            relative_url : `${common.local_style_files}${base_name}.css`,
            media_type   : common.media_types.css,
            absolute_url : `${css_link}.css`,
        })

        // The corresponding logo file must be retrieved
        retval.push({
            relative_url : `${common.local_style_files}logos/${logo_name}.svg`,
            media_type   : common.media_types.svg,
            absolute_url : `${common.TR_logo_files}${logo_name}.svg`,
        })

        // An extra CSS file must be added to the mix, to take care of the EPUB specificities
        retval.push({
            relative_url : `${common.local_style_files}tr_epub.css`,
            media_type   : common.media_types.css,
            text_content : common.tr_epub_css,
        })

        // Adding the reference to the epub specific css file into the dom
        the_link.insertAdjacentHTML('afterend', `<link rel="stylesheet" href="${common.local_style_files}tr_epub.css">`)


        // // Here comes the extra complication: depending on the respec spec status type, extra actions may have to be
        // // taken...
        // let css_extras :specStatus_css_mappings = specStatus_css[global.config.specStatus.toUpperCase()];

        // if (css_extras === undefined && specStatus_simple.includes(global.config.specStatus)) {
        //     // This is a 'standard' case, with a regular structure:
        //     css_extras = {
        //         watermark : false,
        //         logo_name : `${global.config.specStatus}.svg`,
        //     }
        // }

        // if (css_extras !== undefined) {
        //     let template = css_extras.special_template || background_template;

        //     // The logo file references must be adapted in the template
        //     if (css_extras.logo_name !== null) {
        //         template = template.replace('%%%LOGO%%%', css_extras.logo_name);

        //         // Before we forget, add the logo file to the resources!
        //         const media_type    = css_extras.logo_media_type || constants.media_types.svg;
        //         const orig_logo_url = media_type === constants.media_types.svg ? constants.modified_epub_files : constants.TR_logo_files;
        //         retval.push({
        //             relative_url : `${constants.local_style_files}logos/${css_extras.logo_name}`,
        //             media_type   : media_type,
        //             absolute_url : `${orig_logo_url}${css_extras.logo_name}`,
        //         })
        //     }

        //     if (css_extras.watermark) {
        //         // Add the watermark file to the resources!
        //         retval.push({
        //             relative_url : `${constants.local_style_files}logos/UD-watermark.png`,
        //             media_type   : constants.media_types.png,
        //             absolute_url : `${constants.TR_logo_files}UD-watermark.png`,
        //         })
        //     }

        //     // The extra epub CSS reference has to be added to the html source and to the return values
        //     retval.push({
        //         relative_url : `${constants.local_style_files}epub.css`,
        //         media_type   : constants.media_types.css,
        //         text_content : template,
        //     });

        //     const new_css_link = global.html_element.ownerDocument.createElement('link');
        //     new_css_link.setAttribute('href', `${constants.local_style_files}epub.css`);
        //     new_css_link.setAttribute('rel', 'stylesheet');
        //     the_link.parentElement.append(new_css_link);
        // }
    }
    return retval;
}