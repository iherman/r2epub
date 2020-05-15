/**
 * ## Fetch
 *
 * Wrappers around the fetch function.
 *
 * @packageDocumentation
 */

 /**
 *
 *
 */


import * as node_fetch from 'node-fetch';
import * as urlHandler from 'url';
import * as validUrl   from 'valid-url';
import * as jsdom      from 'jsdom';
import * as constants  from './constants';

/**
* Basic sanity check on a URL supposed to be used to retrieve a Web Resource.
*
* The function returns a (possibly slightly modified) version of the URL if everything is fine, or a null value if
* the input argument is not a URL (but should be used as a filename).
*
* There might be errors, however, in the case it is a URL.
*
* The checks are as follows:
*
* 1. Check whether the protocol is http(s). Other protocols are not accepted (actually rejected by fetch, too);
* 2. Run the URL through a valid-url check, which looks at the validity of the URL in terms of characters used, for example;
* 3. Check that the port (if specified) is in the allowed range, i.e., > 1024;
* 4. Check whether the host name is not `localhost` (or equivalents, see [[invalid_host_names]]); this is not allowed, unless the code runs in a client or the environment variable `R2EPUB_LOCAL` is set.
*
* @param address
* @returns  - the URL itself (which might be slightly improved by the valid-url method) or `null` if this is, in fact, not a URL
* @throws  if `address` pretends to be a URL, but it is not acceptable for some reasons.
*/
const check_Web_url = (address :string) :string => {
    const parsed = urlHandler.parse(address);
    if (parsed.protocol === null) {
        // This is not a URL, should be used as a file name
        throw `Invalid URL: no protocol`;
    }

    // Check whether we use the right protocol
    if (['http:', 'https:'].includes(parsed.protocol) === false) {
       throw `URL is not http or https`;
    }

    // Run through the URL validator
    const retval = validUrl.isWebUri(address);
    if (retval === undefined) {
        throw `The URL isn't valid`;
    }

    // Check the port
    if (parsed.port !== null) {
        try {
            const portNumber = Number(parsed.port);
            if (portNumber <= 1024) {
                throw `Unsafe port number used in URL (${parsed.port})`;
            }
        } catch(e) {
            throw `Invalid port number used in URL (${parsed.port})`;
        }
    }

    // Check whether the URL is on an invalid host (mostly localhost). If the code is running in the browser, or
    // there is an explicit setting to allow localhost then it is fine otherwise localhost
    // should be refused.
    if ( !(constants.is_browser || process.env.R2EPUB_LOCAL) ) {
        if (constants.invalid_host_names.includes(parsed.hostname)) {
            throw `Invalid host used in URL (${parsed.hostname})`;
        }
    }

    // If we got this far, this is a proper URL, ready to be used.
    return retval;
}


/**
 * The effective fetch implementation run by the rest of the code.
 *
 * There is no default fetch implementation for `node.js`, hence the necessity to import 'node-fetch'. However, if the code
 * runs in a browser, there is an error message whereby only the fetch implementation in the Window is acceptable.
 *
 * This variable is a simple, polyfill like switch between the two, relying on the existence (or not) of the
 * `process` variable (built-in for `node.js`).
 *
 * I guess this makes this entry a bit polyfill like:-)
 */
const my_fetch: ((arg :string) => Promise<any>) = constants.is_browser ? fetch : node_fetch.default;


/**
 * Fetch a resource.
 *
 * @param resource_url
 * @param force_text - whether the resource should be returned as text in case no content type is set by the server
 * @returns - resource; either a simple text, or a Stream
 * @async
 */
export async function fetch_resource(resource_url :string, force_text :boolean = false) :Promise<any> {
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
                        const response_type = response.headers.get('content-type').split(';')[0].trim();
                        if (response_type && response_type !== '') {
                            if  (constants.text_content.includes(response_type)) {
                                // the simple way, just return text...
                                resolve(response.text())
                            } else {
                                if (force_text){
                                    resolve(response.text())
                                } else {
                                    // return the body without processing, ie, as a blob or a stream
                                    if (constants.is_browser) {
                                        // In a browser, a blob should be returned
                                        resolve(response.blob())
                                     } else {
                                         // In node.js the body is returned as a stream
                                        resolve(response.body)
                                   }
                                }
                            }
                        } else {
                            console.log("return text by default")
                            // No type information on return, let us hope this is something proper
                            // TODO: (in case of a full implementation) to do something intelligent if there is no response header content type.
                            resolve(response.text());
                        }
                    } else {
                        reject(new Error(`HTTP response ${response.status}: ${response.statusText} on ${resource_url}`));
                    }
                })
                .catch((err) => {
                    reject(new Error(`Problem accessing ${final_url}: ${err}`));
                });
        } catch (err) {
            reject(err);
        }
    });
}


/**
 * Fetch the media type of the resource.
 *
 * @param resource_url
 * @returns - the media type
 * @async
 */
export async function fetch_type(resource_url :string) :Promise<string> {
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
                        const type :string = response.headers.get('content-type');
                        resolve(type.split(';')[0].trim());
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
 * Fetch an HTML file via [[fetch_resource]] and parse the result into a DOM instance.
 *
 * @async
 * @param html_url
 * @return - DOM object for the parsed HTML
 * @throws Error if something goes wrong with fetch or DOM Parsing
 */
export async function fetch_html(html_url :string) :Promise<jsdom.JSDOM> {
    try {
        const body = await fetch_resource(html_url, true);
        const retval = new jsdom.JSDOM(body, { url: html_url });
        return retval;
    } catch (err) {
        throw new Error(`HTML parsing error in ${html_url}: ${err}`);
    }
}

