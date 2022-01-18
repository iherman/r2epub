/**
 * ## Some common utilities
 *
 * @packageDocumentation
*/

import * as jsdom  from 'jsdom';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serialize = require("w3c-xmlserializer");


/**
 * “Slice” a long text into lines separated by the (HTML) `<br/>` tag. Used as a rudimentary tool
 * when adding the title lines to an SVG content.
 *
 * Note that if the incoming string _includes_ the `<br/>` tag already, the function returns the text unchanged. This allows the end-user
 * to control the input, if required.
 *
 * @param inp Input text
 * @returns “sliced” text
 */
export function slice_text(inp: string): string {
    const LIMIT = 30;
    const slice_text_array = (words: string[]): string[] => {
        const final: string[] = [];
        let current_length  = 0;
        while (true) {
            if (words.length === 0) {
                return final;
            } else if (current_length + words[0].length < LIMIT) {
                current_length += words[0].length + 1;
                final.push(`${words.shift()} `);
            } else {
                final.push(`${final.pop().trim()}<br/>`)
                return [...final, ...slice_text_array(words)]
            }
        }
    }

    if (inp.length < LIMIT || inp.includes('<br/>') || inp.includes('<br />')) {
        return inp;
    } else {
        const words = inp.split(' ');
        return slice_text_array(words).join('');
    }
}

/**
 * Remove any XML/HTML tags from the input; `<br/>` tags are replaced by space and all other tags are removed.
 *
 * Used when the title may include XML tags but the metadata item should not...
 *
 * @param inp input string
 * @returns input string free of XML tags
 */
export function de_xml(inp: string): string {
    // Do not use the sledgehammer if it makes no sense:
    if (inp.includes('<')) {
        try {
            const dom = jsdom.JSDOM.fragment(inp);
            return dom.textContent;
        } catch (e) {
            // just silently return the original for any issue
            return inp;
        }
    } else {
        return inp;
    }
}


/**
 * @hidden
 */
const months :string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Convert an ISO formatted date to a more readable format.
 *
 * @param date date is ISO format
 */
export function date_to_string(date :string) :string {
    const d = new Date(date);
    const month_name = months[d.getMonth()];
    return `${d.getDate()} ${month_name}, ${d.getFullYear()}`
}


/**
 * @hidden
 */
const entity_codes :string[][] = [
    ['&nbsp;', '&#160;'],
    ['&lt;',    '&#60;'],
    ['&gt;',    '&#62;'],
    ['&quot;',  '&#34;'],
    ['&apos;',  '&#39;'],
    ['&reg;',   '&#174;'],
    ['&pound;', '&#163;'],
    ['&yen;',   '&#165;'],
    ['&euro;',  '&#8364;'],
    ['&cent;',  '&#162;'],
    ['&mdash;', '&#8212;'],
    ['&ndash;', '&#8211;'],
    ['&emsp;',  '&#8195;'],
    ['&ensp;',  '&#8194;'],
    ['&thinsp;','&#8201;'],
]

/**
 * Filter XML entities in an xhtml code, and turn them into their equivalent hexadecimal Unicode point
 *
 * @param inp input string
 * @returns
 */
export function remove_entities(inp: string): string {
    let return_value = inp;
    for (const conversion of entity_codes) {
        const [entity, code] = conversion;
        // This should be a return_value.replaceAll(entity,code), but that function is not
        // implemented in node version 14.*
        return_value = return_value.split(entity).join(code);
    }
    return return_value;
}


/**
 * Convert an HTML5 content (in text or as a DOM) into XHTML5.
 *
 * @param dom - the original content
 * @returns - Same content serialized as XHTML, with entities removed
 */
export function to_xhtml(dom: jsdom.JSDOM | string): string {
    if (typeof dom === "string" ) {
        return remove_entities(dom);
    } else {
        const element = dom.window.document.documentElement;

        // This is necessary; the imported serializer method does not check whether the namespace is already there or not
        // and this leads to a duplication of the attribute;
        element.removeAttribute('xmlns');
        return remove_entities('<!DOCTYPE html>\n' + serialize(element));
    }
}
