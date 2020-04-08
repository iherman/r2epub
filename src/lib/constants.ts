/**
 * `Global constants used at various places.
 *
 * @packageDocumentation
 */

/**
 * Various media types that are used in the code.
 */
export const media_types = {
    json    : 'application/json',
    jsonld  : 'application/ld+json',
    html    : 'text/html',
    xhtml   : 'application/xhtml+xml',
    css     : 'text/css',
    svg     : 'image/svg+xml',
    js      : 'text/javascript',
    es      : 'text/ecmascript',
    png     : 'image/png',
    epub    : 'application/epub+zip'
 };


/** These media types refer to textual content, no reason to bother about streaming when fetching them... */
export const text_content :string[] = [
    media_types.json,
    media_types.jsonld ,
    media_types.html ,
    media_types.xhtml ,
    media_types.css ,
    media_types.svg ,
    media_types.js ,
    media_types.es
];


/** Default port number for the server locally */
export const local_port_number :string = '5000';

/** URL of the spec generator service, used if the source has to be transformed via respec first. */
export const spec_generator       :string = 'https://labs.w3.org/spec-generator/?type=respec&url='

/** Generic 'fixup' script (used for warnings for rescinded or obsolete versions). */
export const fixup_js             :string  = 'https://www.w3.org/scripts/TR/2016/fixup.js';

/** Base URL for the official W3C logos (only the non-SVG ones are used directly). */
export const TR_logo_files        :string = 'https://www.w3.org/StyleSheets/TR/2016/logos/';

/** Base URL for the W3C files (like `base.css`, logos in SVG format) modified for EPUB. */
export const modified_epub_files  :string = 'https://iherman.github.io/r2epub/epub_assets/';

/** Local (relative) URL for styles and logos */
export const local_style_files    :string = 'StyleSheets/TR/2016/';

/** @hidden */
const allow_methods :string[] = ['GET', 'HEAD'];

/** @hidden */
const allow_headers :string[] = [
    'Range',
    'Content-Type',
    'Origin',
    'X-Requested-With',
    'Accept',
    'Accept-Language',
    'Content-Language'
];

/** @hidden */
const expose_headers :string[] = [
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
]


/**
 * CORS headers, to be added to the server response
 */
export const CORS_headers = {
    'Access-Control-Allow-Origin'   : '*',
    'Access-Control-Allow-Methods'  : allow_methods.join(','),
    'Access-Control-Allow-Headers'  : allow_headers.join(','),
    'Access-Control-Expose-Headers' : expose_headers.join(',')
}
