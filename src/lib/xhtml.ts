/**
 * ## XHTML conversion from HTML5
 *
 * Convert an HTML5 content (in text or a DOM) into bona fide XHTML5.
 *
 * It seems that the XHTML serialization of [`jsdom`](https://www.npmjs.com/package/jsdom) (used elsewhere in this library) may not be flawless. This module contains a workaround for the problems originally published in:
 *
 * https://www.npmjs.com/package/xmlserializer
 *
 * @packageDocumentation
 */

/**
 *
 *
 */

import { parse }             from 'parse5';
import { serializeToString } from 'xmlserializer';
import * as jsdom            from 'jsdom';
import { remove_entities }   from './utils';



/**
 * Convert an HTML5 content (in text or as a DOM) into XHTML5.
 *
 * @param html - the original content
 * @returns - Same content serialized as XHTML
 */
export function convert(html: jsdom.JSDOM | string): string {
    const convert_text = (html_text: string) :string => {
        /*
        The code is a bit ugly... it seems that the xhtml serializer relies on the specificities of the parse5 module output.
        On the other hand, the output of that module does not seem to implement a bunch of DOM features that the rest of the code
        relies on which means that it cannot be used elsewhere...
        */
        return '<!DOCTYPE html>' + serializeToString(parse(html_text))
    }

    const return_value = (typeof html === "string") ? convert_text(html) : convert_text(html.serialize());
    return remove_entities(return_value);

    // // Last touch: the result should not include xml entities but only code numbers.
    // // The xhtml conversion should filter them out, but but it does not :-(
    // for (const conversion of constants.entity_codes) {
    //     const [entity, code] = conversion;
    //     // This should be a return_value.replaceAll(entity,code), but that function is not
    //     // implemented in node version 14.*
    //     return_value = return_value.split(entity).join(code);
    // }

    // return return_value;
}
