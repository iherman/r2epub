/**
 * ## Some common utilities
 *
 * @packageDocumentation
*/

import * as xmldom from 'xmldom';

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
        while(true) {
            if (words.length === 0) {
                return final;
            } else if(current_length + words[0].length < LIMIT) {
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
            const clean_br = (txt: string): string => {
                return txt.replace(/<br[ ]*\/>/gi, ' ');
            }
            const option = {
                locator      : {},
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                errorHandler : (level: string, msg: any): any => { return; },
            }
            const dom = (new xmldom.DOMParser(option)).parseFromString(`<_x_>${clean_br(inp)}</_x_>`, 'text/xml');
            return dom.childNodes[0].textContent;
        } catch(e) {
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
