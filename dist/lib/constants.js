"use strict";
/**
 * ## Global constants used at various places.
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
    css: 'text/css',
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
    exports.media_types.es,
    exports.media_types.html,
    exports.media_types.js,
    exports.media_types.json,
    exports.media_types.jsonld,
    exports.media_types.svg,
    exports.media_types.xhtml,
];
/**
 * Invalid host names (essentially "localhost" and friends); unless explicitly set in the environment, these are considered to be unsafe.
 * This is important for server deployment.
 */
exports.invalid_host_names = [
    '127.0.0.1', '127.254.1.2', '10.1.2.3', '10.254.4.5',
    '172.16.1.2', '172.31.4.5', '192.168.0.1', '192.168.254.5',
    'fe80::1', 'fe80:ffff::ffff', 'localhost', 'ip6-localhost'
];
/** Default port number for the server locally.
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
    'Content-Disposition'
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