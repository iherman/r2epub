"use strict";
/**
 * `Global constants used at various places.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Flag to decide whether the code runs in a browser or in node.js
 */
exports.is_browser = (process === undefined || process.title === 'browser');
/**
 * Various media types used in the code.
 */
exports.media_types = {
    json: 'application/json',
    jsonld: 'application/ld+json',
    html: 'text/html',
    xhtml: 'application/xhtml+xml',
    css: 'text/css',
    svg: 'image/svg+xml',
    js: 'text/javascript',
    es: 'text/ecmascript',
    png: 'image/png',
    epub: 'application/epub+zip'
};
/** These media types refer to textual content, no reason to bother about streaming when fetching them... */
exports.text_content = [
    exports.media_types.json,
    exports.media_types.jsonld,
    exports.media_types.html,
    exports.media_types.xhtml,
    exports.media_types.css,
    exports.media_types.svg,
    exports.media_types.js,
    exports.media_types.es
];
/** Default port number for the server locally */
exports.local_port_number = '5000';
/** URL of the spec generator service, used if the source has to be transformed via respec first. */
exports.spec_generator = 'https://labs.w3.org/spec-generator/?type=respec&url=';
/** Generic 'fixup' script (used for warnings for rescinded or obsolete versions). */
exports.fixup_js = 'https://iherman.github.io/r2epub/epub_assets/fixup.js';
// export const fixup_js             :string  = 'https://www.w3.org/scripts/TR/2016/fixup.js';
// If the CORS are set on the W3C site, this may be reversed...
/** Base URL for the official W3C logos (only the non-SVG ones are used directly). */
exports.TR_logo_files = 'https://www.w3.org/StyleSheets/TR/2016/logos/';
/** Base URL for the W3C files (like `base.css`, logos in SVG format) modified for EPUB. */
exports.modified_epub_files = 'https://iherman.github.io/r2epub/epub_assets/';
/** Local (relative) URL for styles and logos */
exports.local_style_files = 'StyleSheets/TR/2016/';
/** @hidden */
const allow_methods = ['GET', 'HEAD'];
/** @hidden */
const allow_headers = [
    'Range',
    'Content-Type',
    'Origin',
    'X-Requested-With',
    'Accept',
    'Accept-Language',
    'Content-Language'
];
/** @hidden */
const expose_headers = [
    'Accept-Ranges',
    'Content-Encoding',
    'Content-Type',
    'Content-Length',
    'Content-Range',
    'Content-Language',
    'Cache-Control',
    'Expires',
    'Last-Modified',
    'Pragma'
];
/**
 * CORS headers, to be added to the server response
 */
exports.CORS_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': allow_methods.join(','),
    'Access-Control-Allow-Headers': allow_headers.join(','),
    'Access-Control-Expose-Headers': expose_headers.join(',')
};
//# sourceMappingURL=constants.js.map