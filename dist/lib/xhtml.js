"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ## XHTML conversion from HTML5
 *
 * Convert an HTML5 content (in text) into XHTML5.
 *
 * It seems that the XHTML serialization of jsdom and others may not be flawless. This module contains a workaround the problems
 * originally published in:
 *
 * https://www.npmjs.com/package/xmlserializer
 *
 * @packageDocumentation
 */
const parse5_1 = require("parse5");
const xmlserializer_1 = require("xmlserializer");
/**
 * Convert an HTML5 content (as a DOM) into XHTML5.
 *
 * @param html_dom - DOM element of the HTML file
 * @returns - Same content serialized as XHTML
 */
function convert_dom(html_dom) {
    return convert_text(html_dom.serialize());
}
exports.convert_dom = convert_dom;
/**
 * Convert an HTML5 content (in text) into XHTML5.
 *
 * @param html_dom - DOM element of the HTML file
 * @returns - Same content serialized as XHTML
 */
function convert_text(html_text) {
    /*
       The code is a bit ugly... it seems that the xhtml serializer relies on the specificities of the parse5 module output.
       On the other hand, the output of that module does not seem to implement a bunch of DOM features that the rest of the code
       relies on which means that it cannot be used elsewhere...
    */
    return '<!DOCTYPE html>' + xmlserializer_1.serializeToString(parse5_1.parse(html_text));
}
exports.convert_text = convert_text;
//# sourceMappingURL=xhtml.js.map