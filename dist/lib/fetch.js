"use strict";
/**
 * ## Fetch
 *
 * Wrappers around the fetch function.
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch_json = exports.fetch_html = exports.fetch_type = exports.fetch_resource = void 0;
/**
 *
 *
 */
const node_fetch = __importStar(require("node-fetch"));
const urlHandler = __importStar(require("url"));
const validUrl = __importStar(require("valid-url"));
const jsdom = __importStar(require("jsdom"));
const constants = __importStar(require("./constants"));
const fs = __importStar(require("fs"));
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
const check_Web_url = (address) => {
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
        }
        catch (e) {
            throw `Invalid port number used in URL (${parsed.port})`;
        }
    }
    // Check whether the URL is on an invalid host (mostly localhost). If the code is running in the browser, or
    // there is an explicit setting to allow localhost, then it is fine otherwise localhost
    // should be refused.
    if (!(constants.is_browser || process.env.R2EPUB_LOCAL)) {
        if (constants.invalid_host_names.includes(parsed.hostname)) {
            throw `Invalid host used in URL (${parsed.hostname})`;
        }
    }
    // If we got this far, this is a proper URL, ready to be used.
    return retval;
};
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
const my_fetch = constants.is_browser ? fetch : node_fetch.default;
/**
 * Fetch a resource.
 *
 * "Fetch" means fetching the resource on the Web. There is one exception, though: some W3C files (e.g., SVG logos) have been modified for EPUB use.
 * These files are also available on the Web (see [`modified_epub_files`](https://iherman.github.io/r2epub/typedoc/modules/_lib_constants_.html#modified_epub_files)) but
 * if the local environment variable `R2EPUB_MODIFIED_EPUB_FILES` is set,
 * then the value is considered to be the name of a local directory, and the files are picked up from that directory via direct, local file system access.
 * This may speed up and, mainly, avoid some fetch errors that unfortunately occur.
 *
 * (I am not sure why those errors occur, mainly when collections are created. I _suspect_ this may be related to an almost simultaneous access to the same files more or less
 * in parallel via an async call to a Promise array, and the servers may not be properly set up for that.)
 *
 * @param resource_url
 * @param force_text - whether the resource should be returned as text in case no content type is set by the server
 * @returns - resource; either a simple text, or a Stream
 * @async
 */
async function fetch_resource(resource_url, force_text = false) {
    if (constants.is_browser === false && process.env.R2EPUB_MODIFIED_EPUB_FILES && resource_url.startsWith(constants.modified_epub_files)) {
        const filename = resource_url.replace(constants.modified_epub_files, process.env.R2EPUB_MODIFIED_EPUB_FILES);
        if (filename.endsWith('.png') && force_text === false) {
            // This is an image; it must be returned as a buffer
            return fs.promises.readFile(filename);
        }
        else {
            return fs.promises.readFile(filename, 'utf-8');
        }
    }
    else {
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
                            if (constants.text_content.includes(response_type)) {
                                // the simple way, just return text...
                                resolve(response.text());
                            }
                            else {
                                if (force_text) {
                                    resolve(response.text());
                                }
                                else {
                                    // return the body without processing, ie, as a blob or a stream
                                    if (constants.is_browser) {
                                        // In a browser, a blob should be returned
                                        resolve(response.blob());
                                    }
                                    else {
                                        // In node.js the body is returned as a stream
                                        resolve(response.body);
                                    }
                                }
                            }
                        }
                        else {
                            console.log("return text by default");
                            // No type information on return, let us hope this is something proper
                            // TODO: (in case of a full implementation) to do something intelligent if there is no response header content type.
                            resolve(response.text());
                        }
                    }
                    else {
                        reject(new Error(`HTTP response ${response.status}: ${response.statusText} on ${resource_url}`));
                    }
                })
                    .catch((err) => {
                    reject(new Error(`Problem accessing ${final_url}: ${err}`));
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.fetch_resource = fetch_resource;
/**
 * Fetch the media type of the resource.
 *
 * @param resource_url
 * @returns - the media type
 * @async
 */
async function fetch_type(resource_url) {
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
                    const type = response.headers.get('content-type');
                    resolve(type.split(';')[0].trim());
                }
                else {
                    reject(new Error(`HTTP response ${response.status}: ${response.statusText} on ${resource_url}`));
                }
            })
                .catch((err) => {
                reject(new Error(`Problem accessing ${resource_url}: ${err}`));
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.fetch_type = fetch_type;
/**
 * Fetch an HTML file via [[fetch_resource]] and parse the result into a DOM instance.
 *
 * @async
 * @param html_url
 * @return - DOM object for the parsed HTML
 * @throws Error if something goes wrong with fetch or DOM Parsing
 */
async function fetch_html(html_url) {
    try {
        const body = await fetch_resource(html_url, true);
        const retval = new jsdom.JSDOM(body, { url: html_url });
        return retval;
    }
    catch (err) {
        throw new Error(`HTML parsing error in ${html_url}: ${err}`);
    }
}
exports.fetch_html = fetch_html;
/**
 * Fetch an JSON file via [[fetch_resource]] and parse the result into an object.
 *
 * @async
 * @param json_url
 * @return - DOM object for the parsed HTML
 * @throws Error if something goes wrong with fetch or DOM Parsing
 */
async function fetch_json(json_url) {
    // Note that if this was used in a browser only, there are shortcuts in the fetch function for this, but that is not the case for
    // node-fetch. :-(
    try {
        const body = await fetch_resource(json_url, true);
        return JSON.parse(body);
    }
    catch (err) {
        throw new Error(`JSON parsing error in ${json_url}: ${err}`);
    }
}
exports.fetch_json = fetch_json;
//# sourceMappingURL=fetch.js.map