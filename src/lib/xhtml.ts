/**
 * Convert an HTML5 content (in text) into XHTML5.
 *
 * It seems that the XHTML serialization of jsdom and others may not be flawless. This is a workaround the problems
 * originally published in:
 *
 * https://www.npmjs.com/package/xmlserializer
 *
 * @packageDocumentation
 */
import { parse }             from 'parse5';
import { serializeToString } from 'xmlserializer';
import * as jsdom            from 'jsdom';


/**
 * Convert an HTML5 content (as a DOM) into XHTML5.
 *
 * @param html_dom - DOM element of the HTML file
 * @returns - Same content serialized as XHTML
 */
export function convert_dom(html_dom: jsdom.JSDOM): string {
    return convert_text(html_dom.serialize());
}

/**
 * Convert an HTML5 content (in text) into XHTML5.
 *
 * @param html_dom - DOM element of the HTML file
 * @returns - Same content serialized as XHTML
 */
export function convert_text(html_text: string): string {
    /*
       The code is a bit ugly... it seems that the xhtml serializer relies on the specificities of the parse5 module output.
       On the other hand, the output of that module does not seem to implement a bunch of DOM features that the rest of the code
       relies on which means that it cannot be used elsewhere...
    */
    return '<!DOCTYPE html>' + serializeToString(parse(html_text))
}
