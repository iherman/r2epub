/**
 * ## CSS files
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
 * into the EPUB file from a separate, but fixed, [URI](https://www.w3.org/People/Ivan/TR_EPUB/base.css)]. This is a
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
import { ResourceRef, Global } from './process';
import * as urlHandler         from 'url';
import { css_media_type, svg_media_type, png_media_type }      from './fetch';

/* ---------------------------------------------- CSS Templates ----------------------------------------- */

/**
 * The basic background css template
 *
 * @hidden
 */
const background_template = `
body {
    background-image: url(logos/%%%LOGO%%%);
}
`;

/**
 * CSS template for 'undefined' documents; it also has a watermark
 * @hidden
 */
const undefined_template = `
body {
    background-image: url(logos/%%%LOGO%%%);
    background-color: transparent;
}

html {
    background: white url(logos/UD-watermark.png);
}
`

/**
 * Template used for BG documents. The logo behavior is different (it takes more space).
 * @hidden
 */
const bg_template   = `
@media screen and (min-width: 28em) {
    body {
        background-image: url('logos/%%%LOGO%%%');
        background-size: auto !important;
    }
    div[role~="main"] {
        padding-left: 150px;
    }

}

@media screen and (min-width: 78em) {
    body:not(.toc-inline) #toc {
        background-attachment: local !important;
    }
    div[role~="main"] {
        padding-top: 150px;
    }
}

@media screen {
    body.toc-sidebar #toc {
        background-attachment: local !important;
    }
    div[role~="main"] {
        padding-top: 150px;
    }
}
`;

/**
 * Template used for CG draft documents. The logo behavior is different (it takes more space) and it uses the common watermark
 * @hidden
 */
const cg_draft_template = `
body {
    background-image: url('logos/%%%LOGO%%%');
    background-size: auto !important;
}
@media screen and (min-width: 28em) {
    div[role~="main"] {
        padding-left: 160px;
    }
}

@media screen and (min-width: 78em) {
    body:not(.toc-inline) #toc {
        background-attachment: local !important;
    };
    div[role~="main"] {
        padding-top: 160px;
    }
}

@media screen {
    body.toc-sidebar #toc {
        background-attachment: local !important;
    }
    div[role~="main"] {
        padding-top: 160px;
    }
}

body {
    background-color: transparent;
}

html {
    background: white url(logos/UD-watermark.png);
    background-repeat: repeat-x;
}
`;

/**
 * Template used for CG final documents. The logo behavior is different (it takes more space)
 * @hidden
 */
const cg_final_template = `
body {
    background-image: url('logos/%%%LOGO%%%');
    background-size: auto !important;
}

@media screen and (min-width: 28em) {
    div[role~="main"] {
        padding-left: 160px;
    }
}

@media screen and (min-width: 78em) {
    body:not(.toc-inline) #toc {
        background-attachment: local !important;
    }
    div[role~="main"] {
        padding-top: 160px;
    }
}

@media screen {
    body.toc-sidebar #toc {
        background-attachment: local !important;
    }
    div[role~="main"] {
        padding-top: 160px;
    }
}
`;


/* --------------------------------- Data on CSS behavior per specStatus values------------------------------------- */


/** `specStatus` values with a common, 'standard' behavior: distinct logos based on value,
 * no watermark, simple background template
 */
const specStatus_simple = [
    'ED', 'WD', 'CR', 'PR', 'PER', 'REC', 'RSCND', 'OBSL', 'SPSD'
]

/** Interface for special cases, ie, when the `specStatus` value does not provide all information… */
interface specStatus_css_mappings {
    /** Is there a watermark? */
    watermark         :boolean,

    /** 'name' (filename) to be used for the logo, e.g., WD, REC, etc. */
    logo_name         :string,

    /** Media type of the logo. Usually SVG, but not always; if missing, `image/svg` is used. */
    logo_media_type?  :string,

    /** Reference to the CSS template to be used. If missing, the simple background setting template is used. */
    special_template? :string
}

/** Interface for the mapping from `specStatus` to its relevant description */
interface specStatus_mapping {
    [propName: string] :specStatus_css_mappings
}

/**
 * Mapping from `specStatus` to its relevant description for the cases when a simple, automatic mapping
 * is not possible. See [[specStatus_css_mappings]] for the definition of the terms.
 */
const specStatus_css :specStatus_mapping = {
    'UNOFFICIAL' : {
        watermark        : true,
        logo_name        : 'UD.png',
        logo_media_type  : png_media_type,
        special_template : undefined_template
    },

    'FPWD' : {
        watermark       : false,
        logo_name       : 'WD.svg',
    },

    'LC' : {
        watermark       : false,
        logo_name       : 'WD.svg',
    },

    'FPWD-NOTE' : {
        watermark       : false,
        logo_name       : 'WG-Note.svg',
    },

    'WG-NOTE' : {
        watermark       : false,
        logo_name       : 'WG-Note.svg',
    },

    'BG-DRAFT' : {
        watermark        : false,
        logo_name        : 'back-bg-draft.png',
        logo_media_type  : png_media_type,
        special_template : bg_template
    },

    'BG-FINAL' : {
        watermark        : false,
        logo_name        : 'back-bg-final.png',
        logo_media_type  : png_media_type,
        special_template : bg_template
    },

    'CG-DRAFT' : {
        watermark        : true,
        logo_name        : 'back-cg-draft.png',
        logo_media_type  : png_media_type,
        special_template : cg_draft_template
    },

    'CG-FINAL' : {
        watermark        : false,
        logo_name        : 'back-cg-final.png',
        logo_media_type  : png_media_type,
        special_template : cg_final_template
    },
}

export const general_epub_files = 'https://www.w3.org/People/Ivan/TR_EPUB/';

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
            relative_url : 'StyleSheets/TR/2016/base.css',
            media_type   : css_media_type,
            absolute_url : `${general_epub_files}base.css`
        })

        // The html content should be modified to refer to the base directly
        the_link.setAttribute('href', 'StyleSheets/TR/2016/base.css');

        // Here comes the extra complication: depending on the respec spec status type, extra actions may have to be
        // taken...

        let css_extras :specStatus_css_mappings = specStatus_css[global.config.specStatus.toUpperCase()];

        if (css_extras === undefined && specStatus_simple.includes(global.config.specStatus)) {
            // This is a 'standard' case, with a regular structure:
            css_extras = {
                watermark : false,
                logo_name : `${global.config.specStatus}.svg`
            }
        }

        if (css_extras !== undefined) {
            let template = css_extras.special_template || background_template;

            // The logo file references must be adapted in the template
            template = template.replace('%%%LOGO%%%', css_extras.logo_name);

            // Before we forget, add the file to the resources!
            const media_type = css_extras.logo_media_type || svg_media_type;
            retval.push({
                relative_url : `StyleSheets/TR/2016/logos/${css_extras.logo_name}`,
                media_type   : media_type,
                absolute_url : media_type === svg_media_type ? `${general_epub_files}${css_extras.logo_name}` : `https://www.w3.org/StyleSheets/TR/2016/logos/${css_extras.logo_name}`
            })

            if (css_extras.watermark) {
                // Before we forget, add the file to the resources!
                retval.push({
                    relative_url : 'StyleSheets/TR/2016/logos/UD-watermark.png',
                    media_type   : png_media_type,
                    absolute_url : 'https://www.w3.org/StyleSheets/TR/2016/logos/$UD-watermark.png'
                })
            }

            // The epub CSS reference has to be added to the html source and to the return values
            retval.push({
                relative_url : 'StyleSheets/TR/2016/epub.css',
                media_type   : css_media_type,
                text_content : template
            });

            const new_css_link = global.html_element.ownerDocument.createElement('link');
            new_css_link.setAttribute('href', 'StyleSheets/TR/2016/epub.css');
            new_css_link.setAttribute('rel', 'stylesheet');
            the_link.parentElement.append(new_css_link);
        }
    }
    return retval;
}
