/**
 * ## Global constants used at various places.
 *
 * @packageDocumentation
*/

/**
 * Flag to decide whether the code runs in a browser or in node.js
 */

export const is_browser :boolean = (process === undefined || process.title === 'browser');

/**
 *
 */
export interface MediaType {
    [propName: string] :string;
}

/**
 * Various media types used in the code.
 */
export const media_types :MediaType = {
    css     : 'text/css',
    text    : 'text/plain',
    epub    : 'application/epub+zip',
    es      : 'text/ecmascript',
    html    : 'text/html',
    js      : 'text/javascript',
    json    : 'application/json',
    jsonld  : 'application/ld+json',
    png     : 'image/png',
    svg     : 'image/svg+xml',
    xhtml   : 'application/xhtml+xml',
 };


/** These media types refer to textual content, no reason to bother about streaming when fetching them... */
export const text_content :string[] = [
    media_types.css,
    media_types.text,
    media_types.es,
    media_types.html,
    media_types.js,
    media_types.json,
    media_types.jsonld,
    media_types.svg,
    media_types.xhtml,
];

/** Valid Spec Status values */
export const spec_status_values :string[] = [
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
export const wcag_checked :string[] = [
    'REC',
    'WG-NOTE',
    'IG-NOTE',
    'NOTE',
    'finding'
];

/**
 * Invalid host names (essentially "localhost" and friends); unless explicitly set in the environment, these are considered to be unsafe.
 * This is important for server deployment.
 */
export const invalid_host_names :string[] = [
    '127.0.0.1', '127.254.1.2', '10.1.2.3', '10.254.4.5',
    '172.16.1.2', '172.31.4.5', '192.168.0.1', '192.168.254.5',
    'fe80::1', 'fe80:ffff::ffff', 'localhost', 'ip6-localhost'
]

/**
 * Acceptable endings for document URL-s. We try to avoid cases when the relative URL calculations go wrong
 */
export const acceptable_url_endings :string[] = [
    '/',
    '.html',
    '.xhtml',
    '.json'
]


/** Default port number for the server locally.
 * Set to the default HTTP port number; the environment variable `PORT` may,
 * however, overwrite this for a server.
 */
export const local_port_number    :string = '80';

/** URL of the spec generator service, used if the source has to be transformed via respec first. */
export const spec_generator       :string = 'https://labs.w3.org/spec-generator/?type=respec&url='

/** Generic 'fixup' script (used for warnings for rescinded or obsolete versions). */
export const fixup_js             :string  = 'https://www.w3.org/scripts/TR/2016/fixup.js';

/** Base URL for the official W3C logos (only the non-SVG ones are used directly). */
export const TR_logo_files        :string = 'https://www.w3.org/StyleSheets/TR/2016/logos/';

/** Base URL for the W3C files (like `base.css`, logos in SVG format) modified for EPUB. */
// export const modified_epub_files  :string = 'https://iherman.github.io/r2epub/epub_assets/';
export const modified_epub_files  :string = 'https://www.ivan-herman.net/r2epub/';

/** Local (relative) URL for styles and logos */
export const local_style_files    :string = 'StyleSheets/TR/2016/';

/** @hidden */
const allow_methods :string[] = ['GET', 'HEAD'];

/** @hidden */
const allow_headers :string[] = [
    'Accept',
    'Accept-Language',
    'Content-Language',
    'Content-Type',
    'Origin',
    'Range',
    'X-Requested-With',
];

/** @hidden */
const expose_headers :string[] = [
    'Accept-Ranges',
    'Content-Encoding',
    'Content-Language',
    'Content-Length',
    'Content-Type',
    'Expires',
    'Last-Modified',
    'Content-Disposition'
]

/**
 * CORS headers to be added to the server response
 */
export const CORS_headers = {
    'Access-Control-Allow-Origin'   : '*',
    'Access-Control-Allow-Methods'  : allow_methods.join(','),
    'Access-Control-Allow-Headers'  : allow_headers.join(','),
    'Access-Control-Expose-Headers' : expose_headers.join(',')
}
