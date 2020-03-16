/**
 * Wrappers around the fetch function.
 */

export type URL = string;

import * as node_fetch from 'node-fetch';
import * as urlHandler from 'url';
import * as validUrl   from 'valid-url';
import * as jsdom      from 'jsdom';

/** Media type for JSON */
export const json_media_type = 'application/json';

/** Media type for JSON-LD */
export const jsonld_media_type = 'application/ld+json';

/** Media type for HTML */
export const html_media_type = 'text/html';

/** Media type for XHTML */
export const xhtml_media_type = 'application/xhtml+xml';

/** Media type for CSS */
export const css_media_type = 'text/css';

/** Media type for SVG */
export const svg_media_type = 'image/svg+xml';

/** Media type for javascript */
export const js_media_type = 'text/javascript';

/** Media type for ecmascript */
export const es_media_type = 'text/ecmascript';

/** These media types refer to textual content, no reason to bother about streaming... */
const text_content = [
    json_media_type,
    jsonld_media_type,
    html_media_type,
    xhtml_media_type,
    css_media_type,
    svg_media_type,
    js_media_type,
    es_media_type
];


/**
* Basic sanity check on a URL that is supposed to be used to retrieve a Web Resource.
*
* The function returns a (possibly slightly modified) version of the URL if everything is fine, or a null value if
* the input argument is not a URL (but should be used as a filename).
*
* There might be errors, however, in the case it is a URL.
*
* The checks are as follows:
*
* 1. Check whether the protocol is http(s). Other protocols are not accepted (actually rejected by fetch, too);
* 2. Run the URL through a valid-url check, which looks at the validity of the URL in terms of
*    characters used, for example;
* 3. Check that the port (if specified) is in the allowed range, ie, > 1024;
*
* @param address - the URL to be checked.
* @returns  - the URL itself (which might be slightly improved by the valid-url method) or null if this is, in fact, not a URL
* @throws  if it pretends to be a URL, but it is not acceptable for some reasons.
*/
const check_Web_url = (address :URL) :URL => {
    const parsed = urlHandler.parse(address);
    if (parsed.protocol === null) {
        // This is not a URL, should be used as a file name
        throw new Error(`"${address}": Invalid URL: no protocol`);
    }

    // Check whether we use the right protocol
    if (['http:', 'https:'].includes(parsed.protocol) === false) {
       throw new Error(`"${address}": URL is not dereferencable`);
    }

    // Run through the URL validator
    const retval = validUrl.isWebUri(address);
    if (retval === undefined) {
        throw new Error(`"${address}": the URL isn't valid`);
    }

    // Check the port
    if (parsed.port !== null) {
        try {
            const portNumber = Number(parsed.port);
            if (portNumber <= 1024) {
                throw new Error(`"${address}": Unsafe port number used in URL (${parsed.port})`);
            }
        } catch(e) {
            throw new Error(`"${address}": Invalid port number used in URL (${parsed.port})`);
        }
    }
    // If we got this far, this is a proper URL, ready to be used.
    return retval;
}


/**
 * The effective fetch implementation run by the rest of the code.
 *
 * If the code is ran in a browser, we get an error message whereby
 * only the fetch implementation in the Window is acceptable for the browser. However, there is
 * no default fetch implementation for `node.js`, hence the necessity to import 'node-fetch' for that case.
 *
 * I guess this makes this entry a bit polyfill like:-)
 */
const my_fetch: ((arg :string) => Promise<any>) = (process !== undefined) ? node_fetch.default : fetch;


/**
 * Fetch a resource.
 *
 * @param resource_url - the resource to be fetched
 * @param force_text - the resource should be returned as text in case no content type is set by the server
 * @returns - resource; either a simple text, or a Stream
 * @async
 */
export async function fetch_resource(resource_url :URL, force_text :boolean = false) :Promise<any> {
    // If there is a problem, an exception is raised
    return new Promise((resolve, reject) => {
        try {
            // This is a real URL, whose content must be accessed via HTTP(S)
            // An exception is raised if the URL has security/sanity issues.
            const final_url = check_Web_url(resource_url);
            my_fetch(final_url)
                .then((response) => {
                    if (response.ok) {
                        // If the response content type is set (which is usually the case, but not in all cases...)
                        const response_type = response.headers.get('content-type');
                        if (response_type && response_type !== '') {
                            if  (text_content.includes(response_type)) {
                                // the simple way, just return text...
                                resolve(response.text())
                            } else {
                                if (force_text){
                                    resolve(response.text())
                                } else {
                                    // return the body without processing, ie, as a stream
                                    resolve(response.body)
                                }
                            }
                        } else {
                            // No type information on return, let us hope this is something proper
                            // TODO: (in case of a full implementation) to do something intelligent if there is no response header content type.
                            resolve(response.text());
                        }
                    } else {
                        reject(new Error(`HTTP response ${response.status}: ${response.statusText} on ${resource_url}`));
                    }
                })
                .catch((err) => {
                    reject(new Error(`Problem accessing ${resource_url}: ${err}`));
                });
        } catch (err) {
            reject(err);
        }
    });
}


/**
 * Fetch the media type of the resource.
 *
 * @param resource_url - the resource to be fetched
 * @returns - resource; either a simple text, or a Stream
 * @async
 */
export async function fetch_type(resource_url :URL) :Promise<string> {
    // If there is a problem, an exception is raised
    return new Promise((resolve, reject) => {
        try {
            // This is a real URL, whose content must be accessed via HTTP(S)
            // An exception is raised if the URL has security/sanity issues.
            const final_url = check_Web_url(resource_url);
            my_fetch(final_url)
                .then((response) => {
                    if (response.ok) {
                        // If the response content type is set (which is usually the case, but not in all cases...)
                        resolve(response.headers.get('content-type'));
                    } else {
                        reject(new Error(`HTTP response ${response.status}: ${response.statusText} on ${resource_url}`));
                    }
                })
                .catch((err) => {
                    reject(new Error(`Problem accessing ${resource_url}: ${err}`));
                });
        } catch (err) {
            reject(err);
        }
    });
}


/**
 * Fetch an HTML file via [[fetch_resource]] and parse the result into the DOM.
 *
 * @async
 * @param html_url - URL to be fetched
 * @return - DOM object for the parsed HTML
 * @throws Error if something goes wrong with fetch or DOM Parsing
 */
export async function fetch_html(html_url :URL) :Promise<jsdom.JSDOM> {
    try {
        const body = await fetch_resource(html_url, true);
        const retval = new jsdom.JSDOM(body, { url: html_url });
        return retval;
    } catch (err) {
        throw new Error(`HTML parsing error in ${html_url}: ${err}`);
    }
}

