"use strict";
/**
 * ## Externally accessible entries
 *
 * r2epub can be used as a library module both to TypeScript and to Javascript. This module is the common entry point from both
 * the [[cli]] or the [[serve]] functions for the command line interface and the server side, respectively. Furthermore,
 * it provides an API that can be used directly; a simple example is as follows:
 *
 * In Typescript (using `node.js`):
 *
 * ```js
 * import * as r2epub  from 'r2epub';
 * import * as fs      from 'fs';
 * // The creation itself is asynchronous (the content has to be fetched over the wire).
 * // The result is the class instance encapsulating an OCF (zip) content
 * const url :string = "http://www.example.org/doc.html",
 * const args :r2epub.Options = {
 *     respec : false,
 *     config : {}
 * };
 * const ocf :r2epub.OCF = await r2epub.convert(url, args);
 * // The zip file is finalized asynchronously
 * const content :Buffer = await ocf.get_content();
 * // Get the content out to the disk
 * fs.writeFileSync(ocf.name, content);
 * ```
 *
 * The same in Javascript (using `node.js`):
 *
 * ```js
 * const r2epub  = require('r2epub');
 * // The creation itself is asynchronous (the content has to be fetched over the wire).
 * // The result is the class instance encapsulating an OCF (zip) content
 * const url = "http://www.example.org/doc.html",
 * const args  = {
 *     respec : false,
 *     config : {}
 * };
 * const ocf = await r2epub.convert(url, args);
 * // The zip file is finalized asynchronously
 * const content = await ocf.get_content();
 * // Get the content out to the disk
 * fs.writeFileSync(ocf.name, content);
 * ```
 *
 * See the detailed specification of the API element below. The top level functional entry point to the package is [[convert]].
 *
 * @packageDocumentation
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = exports.OCF = exports.RespecToEPUB = void 0;
/**
 *
 * classes/lib_convert.RespecToEPUB.html
 * classes/index.RespecToEPUB.html
 */
const common = require("./lib/common");
const ocf = require("./lib/ocf");
const rConvert = require("./lib/convert");
const cConvert = require("./clib/convert");
const fetch = require("./lib/fetch");
const _ = require("underscore");
const urlHandler = require("url");
/**
 * Convenience class, to export the internal [RespecToEPUB](lib_convert.RespecToEpub.html) class for the package as a whole.
 * (This is only useful if, for some reasons, the conversion is done starting with a DOM tree, using [create_epub_from_dom](_lib_convert_.respectoepub.html#create_epub_from_dom). In general, [[convert]] should be used).
 *
 * This class is largely for internal use to the package, and the API user can mostly ignore its details.
 *
 */
class RespecToEPUB extends rConvert.RespecToEPUB {
}
exports.RespecToEPUB = RespecToEPUB;
/**
 * Convenience class to export the internal [OCF](lib_ocf.OCF.html) class for the package as a whole. Conversion methods or functions return an instance of this class, containing the generated EPUB content.
 */
class OCF extends ocf.OCF {
}
exports.OCF = OCF;
/**
 * The top level entry in the package: convert a single Respec file, or a collection thereof, into an EPUB document.
 *
 * @async
 * @param url the URL of either the HTML content (if the target is a single document) or a JSON content (if the target is a collection of HTML documents)
 * @param options ReSpec options in case the source has to be preprocessed by ReSpec
 * @param t whether tracing is set (for debugging)
 * @param p whether the package stops at the creation of an EPUB content and displays the content of the OPF file itself (for debugging)
 */
async function convert(url, options = {}, t = false, p = false) {
    /*
     * Return an [[Options]] instance with all defaults filled in.
     *
     */
    const fill_default_options = (opts) => {
        const defaultConfig = {
            publishDate: null,
            specStatus: null,
            addSectionLinks: null,
            maxTocLevel: null,
        };
        return {
            respec: opts.respec === undefined || opts.respec === null ? false : opts.respec,
            config: _.defaults(opts.config, defaultConfig),
        };
    };
    // At the minimum, the URL part of the Arguments should exist, better check this
    if (url) {
        // Basic sanity check on the URL; secure that it is proper for relative URL-s
        const url_path = urlHandler.parse(url).path;
        const proper_ending = common.acceptable_url_endings.map((ending) => url_path.endsWith(ending)).includes(true);
        if (proper_ending) {
            let the_ocf;
            const media_type = await fetch.fetch_type(url);
            if (media_type === common.media_types.json) {
                // If the URL refers to a JSON file, it is the configuration file for a full collection.
                the_ocf = await cConvert.create_epub(url, p);
            }
            else if (media_type === common.media_types.html || media_type === common.media_types.xhtml) {
                // Just a sanity check that the return type is indeed HTML
                the_ocf = await (new rConvert.RespecToEPUB(t, p)).create_epub(url, fill_default_options(options));
            }
            else {
                throw "The URL should refer to an (X)HTML or a JSON content";
            }
            return the_ocf;
        }
        else {
            throw "The URL must end with '.(x)html', '.json', or the '/' character";
        }
    }
    else {
        throw "No URL has been provided for the conversion";
    }
}
exports.convert = convert;
//# sourceMappingURL=index.js.map