"use strict";
/**
 * ## Global constants used at various places.
 *
 * @packageDocumentation
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.tr_epub_css = exports.CORS_headers = exports.local_style_files = exports.modified_epub_files = exports.TR_logo_files = exports.fixup_js = exports.spec_generator = exports.local_port_number = exports.entity_codes = exports.acceptable_url_endings = exports.invalid_host_names = exports.wcag_checked = exports.spec_status_values = exports.text_content = exports.media_types = exports.is_browser = void 0;
/**
 * Flag to decide whether the code runs in a browser or in node.js
 */
exports.is_browser = (process === undefined || process.title === 'browser');
/**
 * Various media types used in the code.
 */
exports.media_types = {
    css: 'text/css',
    text: 'text/plain',
    epub: 'application/epub+zip',
    es: 'text/ecmascript',
    html: 'text/html',
    js: 'text/javascript',
    json: 'application/json',
    jsonld: 'application/ld+json',
    png: 'image/png',
    svg: 'image/svg+xml',
    xhtml: 'application/xhtml+xml',
};
/** These media types refer to textual content, no reason to bother about streaming when fetching them... */
exports.text_content = [
    exports.media_types.css,
    exports.media_types.text,
    exports.media_types.es,
    exports.media_types.html,
    exports.media_types.js,
    exports.media_types.json,
    exports.media_types.jsonld,
    exports.media_types.svg,
    exports.media_types.xhtml,
];
/** Valid Spec Status values */
exports.spec_status_values = [
    'base',
    'MO',
    'unofficial',
    'ED',
    'FPWD',
    'WD',
    'LC',
    'LD',
    'LS',
    'CR',
    'CRD',
    'PR',
    'PER',
    'REC',
    'RSCND',
    'FPWD-NOTE',
    'NOTE',
    'WG-NOTE',
    'BG-DRAFT',
    'BG-FINAL',
    'CG-DRAFT',
    'CG-FINAL',
    'Member-SUBM',
    'draft-finding',
    'finding',
];
/** Document types that are supposed to be WCAG A level due to the W3C publication check. */
exports.wcag_checked = [
    'REC',
    'WG-NOTE',
    'IG-NOTE',
    'NOTE',
    'finding',
];
/**
 * Invalid host names (essentially "localhost" and friends); unless explicitly set in the environment, these are considered to be unsafe.
 * This is important for server deployment.
 */
exports.invalid_host_names = [
    '127.0.0.1', '127.254.1.2', '10.1.2.3', '10.254.4.5',
    '172.16.1.2', '172.31.4.5', '192.168.0.1', '192.168.254.5',
    'fe80::1', 'fe80:ffff::ffff', 'localhost', 'ip6-localhost',
];
/**
 * Acceptable endings for document URL-s. We try to avoid cases when the relative URL calculations go wrong
 */
exports.acceptable_url_endings = [
    '/',
    '.html',
    '.xhtml',
    '.json',
];
/**
 * Entity/code pairs: the XHTML conversion is supposed to remove the XML entities (if used) to their
 * code alternatives.
 *
 * The table is not exhaustive, of course, but contains the most frequently used characters
 * in specifications.
 */
exports.entity_codes = [
    ['&nbsp;', '&#160;'],
    ['&lt;', '&#60;'],
    ['&gt;', '&#62;'],
    ['&quot;', '&#34;'],
    ['&apos;', '&#39;'],
    ['&reg;', '&#174;'],
    ['&pound;', '&#163;'],
    ['&yen;', '&#165;'],
    ['&euro;', '&#8364;'],
    ['&cent;', '&#162;'],
    ['&mdash;', '&#8212;'],
    ['&ndash;', '&#8211;'],
    ['&emsp;', '&#8195;'],
    ['&ensp;', '&#8194;'],
    ['&thinsp;', '&#8201;'],
];
/**
 * Default port number for the server locally.
 * Set to the default HTTP port number; the environment variable `PORT` may,
 * however, overwrite this for a server.
 */
exports.local_port_number = '80';
/** URL of the spec generator service, used if the source has to be transformed via respec first. */
exports.spec_generator = 'https://labs.w3.org/spec-generator/?type=respec&url=';
/** Generic 'fixup' script (used for warnings for rescinded or obsolete versions). */
exports.fixup_js = 'https://www.w3.org/scripts/TR/2016/fixup.js';
/** Base URL for the official W3C logos (only the non-SVG ones are used directly). */
exports.TR_logo_files = 'https://www.w3.org/StyleSheets/TR/2016/logos/';
/** Base URL for the W3C files (like `base.css`, logos in SVG format) modified for EPUB. */
// export const modified_epub_files  :string = 'https://iherman.github.io/r2epub/epub_assets/';
exports.modified_epub_files = 'https://www.ivan-herman.net/r2epub/';
/** Local (relative) URL for styles and logos */
exports.local_style_files = 'StyleSheets/TR/2016/';
/** @hidden */
const allow_methods = ['GET', 'HEAD'];
/** @hidden */
const allow_headers = [
    'Accept',
    'Accept-Language',
    'Content-Language',
    'Content-Type',
    'Origin',
    'Range',
    'X-Requested-With',
];
/** @hidden */
const expose_headers = [
    'Accept-Ranges',
    'Content-Encoding',
    'Content-Language',
    'Content-Length',
    'Content-Type',
    'Expires',
    'Last-Modified',
    'Content-Disposition',
];
/**
 * CORS headers to be added to the server response
 */
exports.CORS_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': allow_methods.join(','),
    'Access-Control-Allow-Headers': allow_headers.join(','),
    'Access-Control-Expose-Headers': expose_headers.join(','),
};
/**
 * Extra CSS file for EPUB content; mainly used to adapt and, possibly, to compensate the effects of the
 * main CSS file. The features are
 *
 * 1. Due to the problems with Apple Books, the target DOM is modified by adding an extra `div` element, which carries the padding statements. Books does not understand a padding and margin on the body element, hence this addition...
 * 2. A number of page break control added to header elements, definition lists, or figure elements (even if, at this time, not many reading systems really honer these...)
 * 3. The outdated warning boxes are stuck to the bottom, instead coming up with interaction
 * 4. The table of content, as generated into the file, is removed (via a `display` attribute); its content is put into a separate navigation file used by the reading system.
 */
exports.tr_epub_css = `
div[role~="main"] {
    margin: 0 auto;                              /* center text within page                     */
    max-width: none;
    padding: 1.6em 1.5em 2em 50px;               /* assume 16px font size for downlevel clients */
    padding: 1.6em 1.5em 2em calc(26px + 1.5em); /* leave space for status flag     */
}

body {
    max-width: 100% !important;
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

.outdated-warning {
    position: absolute;
    border-style: solid;
    border-color: red;
}

.outdated-warning input {
    display: none;
}

p.copyright,
p.copyright small { font-size: small; }

#toc-nav, #toc-toggle-inline {
    display:none !important;
}

#back-to-top, .toc-toggle {
    display: none !important;
}

nav#toc {
    display: none
}
`;
//# sourceMappingURL=constants.js.map