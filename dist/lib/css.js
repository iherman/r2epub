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
const constants = __importStar(require("./constants"));
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
];
/**
 * Mapping from `specStatus` to its relevant description for the cases when a simple, automatic mapping
 * is not possible. See [[specStatus_css_mappings]] for the definition of the terms.
 */
const specStatus_css = {
    'UNOFFICIAL': {
        watermark: true,
        logo_name: 'UD.png',
        logo_media_type: constants.media_types.png,
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
        logo_media_type: constants.media_types.png,
        special_template: bg_template
    },
    'BG-FINAL': {
        watermark: false,
        logo_name: 'back-bg-final.png',
        logo_media_type: constants.media_types.png,
        special_template: bg_template
    },
    'CG-DRAFT': {
        watermark: true,
        logo_name: 'back-cg-draft.png',
        logo_media_type: constants.media_types.png,
        special_template: cg_draft_template
    },
    'CG-FINAL': {
        watermark: false,
        logo_name: 'back-cg-final.png',
        logo_media_type: constants.media_types.png,
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
            relative_url: `${constants.local_style_files}base.css`,
            media_type: constants.media_types.css,
            absolute_url: `${constants.modified_epub_files}base.css`
        });
        // The html content should be modified to refer to the base directly
        the_link.setAttribute('href', `${constants.local_style_files}base.css`);
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
            const media_type = css_extras.logo_media_type || constants.media_types.svg;
            const orig_logo_url = media_type === constants.media_types.svg ? constants.modified_epub_files : constants.TR_logo_files;
            retval.push({
                relative_url: `${constants.local_style_files}logos/${css_extras.logo_name}`,
                media_type: media_type,
                absolute_url: `${orig_logo_url}${css_extras.logo_name}`
            });
            if (css_extras.watermark) {
                // Before we forget, add the file to the resources!
                retval.push({
                    relative_url: `${constants.local_style_files}logos/UD-watermark.png`,
                    media_type: constants.media_types.png,
                    absolute_url: `${constants.TR_logo_files}UD-watermark.png`
                });
            }
            // The epub CSS reference has to be added to the html source and to the return values
            retval.push({
                relative_url: `${constants.local_style_files}epub.css`,
                media_type: constants.media_types.css,
                text_content: template
            });
            const new_css_link = global.html_element.ownerDocument.createElement('link');
            new_css_link.setAttribute('href', `${constants.local_style_files}epub.css`);
            new_css_link.setAttribute('rel', 'stylesheet');
            the_link.parentElement.append(new_css_link);
        }
    }
    return retval;
}
exports.extract_css = extract_css;
//# sourceMappingURL=css.js.map