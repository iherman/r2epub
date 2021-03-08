"use strict";
/**
 * ## Some common utilities
 *
 * @packageDocumentation
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove_entities = exports.date_to_string = exports.de_xml = exports.slice_text = void 0;
const xmldom = require("xmldom");
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
function slice_text(inp) {
    const LIMIT = 30;
    const slice_text_array = (words) => {
        const final = [];
        let current_length = 0;
        while (true) {
            if (words.length === 0) {
                return final;
            }
            else if (current_length + words[0].length < LIMIT) {
                current_length += words[0].length + 1;
                final.push(`${words.shift()} `);
            }
            else {
                final.push(`${final.pop().trim()}<br/>`);
                return [...final, ...slice_text_array(words)];
            }
        }
    };
    if (inp.length < LIMIT || inp.includes('<br/>') || inp.includes('<br />')) {
        return inp;
    }
    else {
        const words = inp.split(' ');
        return slice_text_array(words).join('');
    }
}
exports.slice_text = slice_text;
/**
 * Remove any XML/HTML tags from the input; `<br/>` tags are replaced by space and all other tags are removed.
 *
 * Used when the title may include XML tags but the metadata item should not...
 *
 * @param inp input string
 * @returns input string free of XML tags
 */
function de_xml(inp) {
    // Do not use the sledgehammer if it makes no sense:
    if (inp.includes('<')) {
        try {
            const clean_br = (txt) => {
                return txt.replace(/<br[ ]*\/>/gi, ' ');
            };
            const option = {
                locator: {},
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                errorHandler: (level, msg) => { return; },
            };
            const dom = (new xmldom.DOMParser(option)).parseFromString(`<_x_>${clean_br(inp)}</_x_>`, 'text/xml');
            return dom.childNodes[0].textContent;
        }
        catch (e) {
            // just silently return the original for any issue
            return inp;
        }
    }
    else {
        return inp;
    }
}
exports.de_xml = de_xml;
/**
 * @hidden
 */
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
/**
 * Convert an ISO formatted date to a more readable format.
 *
 * @param date date is ISO format
 */
function date_to_string(date) {
    const d = new Date(date);
    const month_name = months[d.getMonth()];
    return `${d.getDate()} ${month_name}, ${d.getFullYear()}`;
}
exports.date_to_string = date_to_string;
/**
 * @hidden
 */
const entity_codes = [
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
 * Filter XML entities in an xhtml code, and turn them into their equivalent hexadecimal Unicode point
 *
 * @param inp input string
 * @returns
 */
function remove_entities(inp) {
    let return_value = inp;
    for (const conversion of entity_codes) {
        const [entity, code] = conversion;
        // This should be a return_value.replaceAll(entity,code), but that function is not
        // implemented in node version 14.*
        return_value = return_value.split(entity).join(code);
    }
    return return_value;
}
exports.remove_entities = remove_entities;
//# sourceMappingURL=utils.js.map