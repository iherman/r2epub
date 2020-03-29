"use strict";
/**
 * Various ants used all over the place...
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Various media types that are used in the code
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
/** URL of the spec generator service, used if the source has to be transformed first */
exports.spec_generator = 'https://labs.w3.org/spec-generator/?type=respec&url=';
/** Base URL for the official W3C files (`base.css`, logos in SVG format) */
exports.TR_logo_files = 'https://www.w3.org/StyleSheets/TR/2016/logos/';
/** Generic 'fixup' javascript */
exports.fixup_js = 'https://www.w3.org/scripts/TR/2016/fixup.js';
/** Base URL for the modified W3C files (`base.css`, logos in SVG format) */
exports.modified_epub_files = 'https://www.w3.org/People/Ivan/TR_EPUB/';
/** Local (relative) URL for styles and logos */
exports.local_style_files = 'StyleSheets/TR/2016/';
//# sourceMappingURL=constants.js.map