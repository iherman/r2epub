"use strict";
/**
 * ## Simple server for EPUB generation
 *
 * It takes the parameters in a query string, generates and returns an EPUB 3.2 instance to the caller.
 *
 * The possible query parameters are
 *
 * ```
 * url              The URL for the content
 * respec           Whether the source is in respec (true) or a final HTML (false).
 * publishDate      Publication date
 * specStatus       Specification type
 * addSectionLinks  Add section links with "§"
 * maxTocLevel      Max TOC level
 *```
 *
 *
 * The module is a wrapper around a standard node.js `http.CreateServer`, and a call to [[create_epub]].
 *
 * ### Usage examples:
 *
 * (In all examples, the URL for the server is set to `https://epub.example.org`)
 *
 * Convert the HTML file (as generated by ReSpec) to an EPUB 3.2 file. The generated publication's name is `short-name.epub`, where `short-name` is set in the ReSpec configuration:
 *
 * ``` sh
 * https://epub.example.org?url=https://www.example.org/doc.html
 * ```
 *
 * Convert the HTML _ReSpec source_ to an EPUB 3.2 file. The source is converted on-the-fly by respec:
 *
 * ``` sh
 * https://epub.example.org?url=https://www.example.org/doc.html&respec=true`
 * ```
 *
 * Convert the HTML _ReSpec source_ to an EPUB 3.2 file, setting its spec status to REC. The source is converted on-the-fly by respec, overwriting the `specStatus` entry in the configuration to `REC`:
 *
 * ``` sh
 * https://epub.example.org?url=https://www.example.org/doc.html&respec=true&specStatus=REC`
 * ```

 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const urlHandler = __importStar(require("url"));
const _ = __importStar(require("underscore"));
const constants = __importStar(require("./lib/constants"));
const convert = __importStar(require("./lib/convert"));
const home = __importStar(require("./lib/home"));
/**
 * Generate the EPUB file. This is a wrapper around [[create_epub]], creating the necessary arguments [[Arguments]] structure based on the incoming URL's query string.
 *
 * @param query - The query string from the client
 */
async function get_epub(query) {
    const respec_args = _.omit(query, 'respec', 'url', 'submit');
    _.keys(respec_args).forEach((key) => {
        if (respec_args[key] !== undefined && (respec_args[key] === '' || respec_args[key] === 'null')) {
            delete respec_args[key];
        }
    });
    const document = {
        url: query.url,
        respec: (query.respec !== undefined && (query.respec === 'true' || query.respec === true)),
        config: respec_args,
    };
    // console.log(JSON.stringify(document, null, 4))
    const conversion_process = new convert.RespecToEPUB(false, false);
    const the_ocf = await conversion_process.create_epub(document);
    const content = await the_ocf.get_content();
    return {
        content: content,
        headers: {
            'Content-type': constants.media_types.epub,
            'Expires': (new Date()).toString(),
            'Content-Disposition': `attachment; filename=${the_ocf.name}`
        }
    };
}
/**
 * Run a rudimentary Web server calling out to [[create_epub]] via [[get_epub]] to return an EPUB 3.2 instance when invoked. If there is no proper query string a fixed page is displayed.
 */
async function serve() {
    const port = process.env.PORT || constants.local_port_number;
    http_1.default.createServer(async (request, response) => {
        const error = (code, e) => {
            response.writeHead(code, {
                'Content-type': 'text/plain'
            });
            response.write(e);
        };
        try {
            if (request.method === 'GET' || request.method === 'HEAD') {
                const query = urlHandler.parse(request.url, true).query;
                const host = `http://${request.headers.host}`;
                if (query === null || query.url === undefined) {
                    // fall back on the fixed home page
                    response.writeHead(200, _.extend({ 'Content-type': 'text/html' }, constants.CORS_headers));
                    response.write(home.homepage.replace(/%%%SERVER%%%/g, host));
                }
                else {
                    const the_book = await get_epub(query);
                    response.writeHead(200, _.extend(the_book.headers, constants.CORS_headers));
                    response.write(the_book.content);
                }
            }
            else {
                error(501, `Invalid HTTP request method: ${request.method}`);
            }
        }
        catch (e) {
            error(500, `Error during EPUB generation: ${e.toString()}`);
        }
        finally {
            response.end();
        }
    }).listen(port);
}
serve();
//# sourceMappingURL=server.js.map