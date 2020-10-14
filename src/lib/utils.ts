/**
 * ## Some common utilities
 *
 * @packageDocumentation
*/

/**
 * “Slice” a long text into (HTML) lines: in the text some spaces are replaced, if necessary, by HTML `<br/>` tags. Used as a rudimentary tool
 * when adding the title lines to an SVG content.
 *
 * @param inp Input string
 * @returns “sliced” text
 */
export function slice_text(inp: string): string {
    const LIMIT = 30;
    const slice_text_array = (words: string[]): string[] => {
        let final: string[] = [];
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

    if (inp.length < LIMIT) {
        return inp;
    } else {
        const words = inp.split(' ');
        return slice_text_array(words).join('');
    }
}


/**
 * @hidden
 */
const months :string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Convert an ISO formatted date in a more readable format.
 *
 * @param date date is ISO format
 */
export function date_to_string(date :string) :string {
    const d = new Date(date);
    const month_name = months[d.getMonth()];
    return `${d.getDate()} ${month_name}, ${d.getFullYear()}`
}
