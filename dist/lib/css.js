"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const urlHandler = __importStar(require("url"));
const fetch_1 = require("./fetch");
/* ---------------------------------------------- CSS Templates ----------------------------------------- */
/**
 * Book specific css additions. This is necessary to:
 *
 * - Take care of page breaks (although, alas!, not many reading system handles these properly. Yet?)
 * - Turn off the built-in TOC altogether; it is moved to a separate nav file, and displayed by the reading system.
 *
 */
const extra_css = `
body {
    padding: 0 0 0 0 !important;
    max-width: none !important;
}

h2 {
    page-break-before: always;
    page-break-inside: avoid;
    page-break-after: avoid;
}

div.head h2 {
    page-break-before: auto;
    page-break-inside: avoid;
    page-break-after: avoid;
}

figure {
    page-break-inside: avoid;
}

h3, h4, h5 {
    page-break-after: avoid;
}

dl dt {
    page-break-after: avoid;
}

dl dd {
    page-break-before: avoid;
}

div.example, div.note, pre.idl, .warning, table.parameters, table.exceptions {
    page-break-inside: avoid;
}

p {
    orphans: 4;
    widows: 2;
}

#toc-nav, #toc-toggle-inline {
    display:none;
}

#back-to-top, .toc-toggle {
    display: none;
}

.figure, figure {
    margin-left: auto;
    margin-right: auto;
}

nav#toc {
    display: none
}
`;
/**
 * The basic background css template
 *
 * @hidden
 */
const background_template = `
body {
    background-image: url(logos/%%%LOGO%%%);
}
${extra_css}
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
${extra_css}
`;
/**
 * Template used for BG documents. The logo behavior is different (it takes more space).
 * @hidden
 */
const bg_template = `
@media screen and (min-width: 28em) {
    body {
        background-image: url('logos/%%%LOGO%%%');
        background-size: auto !important;
        padding-left: 150px;
    }
}

@media screen and (min-width: 78em) {
    body:not(.toc-inline) #toc {
        padding-top: 150px;
        background-attachment: local !important;
    };
}

@media screen {
    body.toc-sidebar #toc {
        padding-top: 150px;
        background-attachment: local !important;
    };
}
${extra_css}
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
    body {
        padding-left: 160px;
    }
}

@media screen and (min-width: 78em) {
    body:not(.toc-inline) #toc {
        padding-top: 160px;
        background-attachment: local !important;
    };
}

@media screen {
    body.toc-sidebar #toc {
        padding-top: 160px;
        background-attachment: local !important;
    };
}

body {
    background-color: transparent;
}

html {
    background: white url(logos/UD-watermark.png);
    background-repeat: repeat-x;
}
${extra_css}
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
    body {
        padding-left: 160px;
    }
}

@media screen and (min-width: 78em) {
    body:not(.toc-inline) #toc {
        padding-top: 160px;
        background-attachment: local !important;
    };
}

@media screen {
    body.toc-sidebar #toc {
        padding-top: 160px;
        background-attachment: local !important;
    };
}
${extra_css}
`;
/* --------------------------------- Data on CSS behavior per specStatus values------------------------------------- */
/** `specStatus` values with a common, 'standard' behavior: distinct logos based on value,
 * no watermark, simple background template
 */
const specStatus_simple = [
    'ED', 'WD', 'CR', 'PR', 'PER', 'REC', 'RSCND', 'OBSL', 'SPSD'
];
/**
 * Mapping from `specStatus` to its relevant description for the cases when a simple, automatic mapping
 * is not possible. See [[specStatus_css_mappings]] for the definition of the terms.
 */
const specStatus_css = {
    'UNOFFICIAL': {
        watermark: true,
        logo_name: 'UD.png',
        logo_media_type: fetch_1.png_media_type,
        special_template: undefined_template
    },
    'FPWD': {
        watermark: false,
        logo_name: 'WD.svg',
    },
    'LC': {
        watermark: false,
        logo_name: 'WD.svg',
    },
    'FPWD-NOTE': {
        watermark: false,
        logo_name: 'WG-Note.svg',
    },
    'WG-NOTE': {
        watermark: false,
        logo_name: 'WG-Note.svg',
    },
    'BG-DRAFT': {
        watermark: false,
        logo_name: 'back-bg-draft.png',
        logo_media_type: fetch_1.png_media_type,
        special_template: bg_template
    },
    'BG-FINAL': {
        watermark: false,
        logo_name: 'back-bg-final.png',
        logo_media_type: fetch_1.png_media_type,
        special_template: bg_template
    },
    'CG-DRAFT': {
        watermark: true,
        logo_name: 'back-cg-draft.png',
        logo_media_type: fetch_1.png_media_type,
        special_template: cg_draft_template
    },
    'CG-FINAL': {
        watermark: false,
        logo_name: 'back-cg-final.png',
        logo_media_type: fetch_1.png_media_type,
        special_template: cg_final_template
    },
};
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
function extract_css(global) {
    /** Find the relevant CSS link in the DOM. There must be only one... */
    const css_link_element = () => {
        const all_links = Array.from(global.html_element.querySelectorAll('link[rel="stylesheet"]'));
        // What we want, is the one owned by W3C (may be undefined!)
        return all_links.find((link) => {
            if (link.hasAttribute('href')) {
                const parsed = urlHandler.parse(link.getAttribute('href'));
                return parsed.host === 'www.w3.org';
            }
            else {
                return false;
            }
        });
    };
    const retval = [];
    const the_link = css_link_element();
    if (the_link !== undefined) {
        // 'base' CSS file, to be added
        retval.push({
            relative_url: 'StyleSheets/TR/2016/base.css',
            media_type: fetch_1.css_media_type,
            absolute_url: 'https://www.w3.org/StyleSheets/TR/2016/base.css'
        });
        // The html content should be modified to refer to the base directly
        the_link.setAttribute('href', 'StyleSheets/TR/2016/base.css');
        // Here comes the extra complication: depending on the respec spec status type, extra actions may have to be
        // taken...
        let css_extras = specStatus_css[global.config.specStatus.toUpperCase()];
        if (css_extras === undefined && specStatus_simple.includes(global.config.specStatus)) {
            // This is a 'standard' case, with a regular structure:
            css_extras = {
                watermark: false,
                logo_name: `${global.config.specStatus}.svg`
            };
        }
        if (css_extras !== undefined) {
            let template = css_extras.special_template || background_template;
            // The logo file references must be adapted in the template
            template = template.replace('%%%LOGO%%%', css_extras.logo_name);
            // Before we forget, add the file to the resources!
            retval.push({
                relative_url: `StyleSheets/TR/2016/logos/${css_extras.logo_name}`,
                media_type: css_extras.logo_media_type || fetch_1.svg_media_type,
                absolute_url: `https://www.w3.org/StyleSheets/TR/2016/logos/${css_extras.logo_name}`
            });
            if (css_extras.watermark) {
                // Before we forget, add the file to the resources!
                retval.push({
                    relative_url: 'StyleSheets/TR/2016/logos/UD-watermark.png',
                    media_type: fetch_1.png_media_type,
                    absolute_url: 'https://www.w3.org/StyleSheets/TR/2016/logos/$UD-watermark.png'
                });
            }
            // The epub CSS reference has to be added to the html source and to the return values
            retval.push({
                relative_url: 'StyleSheets/TR/2016/epub.css',
                media_type: fetch_1.css_media_type,
                text_content: template
            });
            const new_css_link = global.html_element.ownerDocument.createElement('link');
            new_css_link.setAttribute('href', 'StyleSheets/TR/2016/epub.css');
            new_css_link.setAttribute('rel', 'stylesheet');
            the_link.parentElement.append(new_css_link);
        }
    }
    return retval;
}
exports.extract_css = extract_css;
//# sourceMappingURL=css.js.map