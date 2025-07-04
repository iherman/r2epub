/**
 * @module
 * 
 * @packageDocumentation
*/

/**
 *
 * classes/lib_convert.RespecToEPUB.html
 * classes/index.RespecToEPUB.html
 */

import type { Options, ConfigOptions }  from './lib/common.ts';
import * as common                      from './lib/common.ts';
import * as ocf                         from './lib/ocf.ts';
import * as rConvert                    from './lib/convert.ts';
import * as cConvert                    from './lib/clib/convert.ts';
import * as fetch                       from './lib/fetch.ts';
import * as urlHandler                  from 'node:url';

/**
 * Options provided by the user if and when the source has to be pre-processed via ReSpec.
 *
 * The original content file has to be pre-processed via the W3C [spec generator service](https://labs.w3.org/spec-generator/)
 * before further processing to convert the ReSpec source first. If that is the case (see [[Options.respec]]), it is also possible to set some of the ReSpec configuration options,
 * overwriting the values set in the `config` entry of the original file. The possible ReSpec options to be set are `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel`.
 * See the [ReSpec editor's guide](https://respec.org/docs/) for details.
 *
 */
export type { Options } from './lib/common.ts';

/** Valid Spec Status values */
export { spec_status_values, ENV_MODIFIED_FILE_LOCATION } from './lib/common.ts';

/**
 * Convenience class, to export the internal [RespecToEPUB](./lib/convert.ts/~/RespecToEPUB.html) class for the package as a whole.
 * (This is only useful if, for some reasons, the conversion is done starting with a DOM tree, using [create_epub_from_dom](./lib/convert.ts/~/RespecToEPUB.prototype.create_epub_from_dom.html). In general, [`convert`](./~/convert.html) should be used).
 *
 * This class is largely for internal use to the package, and the API user can mostly ignore its details.
 *
 */
export class RespecToEPUB extends rConvert.RespecToEPUB {}

/**
 * Convenience class to export the internal [OCF](./lib/ocf.ts/~/OCF.html) class for the package as a whole. Conversion methods or functions return an instance of this class, containing the generated EPUB content.
 */
export class OCF extends ocf.OCF {}

/**
 * The top level entry in the package: convert a single Respec file, or a collection thereof, into an EPUB document.
 *
 * @async
 * @param url the URL of either the HTML content (if the target is a single document) or a JSON content (if the target is a collection of HTML documents)
 * @param options ReSpec options in case the source has to be preprocessed by ReSpec
 * @param trace whether tracing is set (for debugging)
 * @param packageOnly whether the package stops at the creation of an EPUB content and displays the content of the OPF file itself (for debugging)
 */
export async function convert(url: string, options: Options = {}, trace = false, packageOnly = false) :Promise<OCF> {
    /*
     * Return an [[Options]] instance with all defaults filled in.
     *
     */
    const fill_default_options = (opts: Options) :Options => {
        const defaultConfig :ConfigOptions = {
            publishDate     : '',
            specStatus      : 'base',
            addSectionLinks : false,
            maxTocLevel     : "7",
        }
        return {
            respec : opts.respec === undefined || opts.respec === null ? false : opts.respec,
            config : {...defaultConfig, ...opts.config},
        };
    };

    // At the minimum, the URL part of the Arguments should exist, better check this
    if (url) {
        // Basic sanity check on the URL; secure that it is proper for relative URL-s
        const url_path = urlHandler.parse(url).path;
        if (url_path === undefined || url_path === null) {
            throw "The URL must be a valid URL, with a proper path";
        }
        // Check that the URL ends with a proper ending, i.e., '.(x)html', '.json', etc
        const proper_ending :boolean = common.acceptable_url_endings.map((ending :string) :boolean => url_path.endsWith(ending)).includes(true);
        if (proper_ending) {
            let the_ocf :ocf.OCF;
            const media_type :string = await fetch.fetch_type(url);
            if (media_type === common.media_types.json) {
                // If the URL refers to a JSON file, it is the configuration file for a full collection.
                the_ocf = await cConvert.create_epub(url, packageOnly);
            } else if (media_type === common.media_types.html || media_type === common.media_types.xhtml) {
                // Just a sanity check that the return type is indeed HTML
                the_ocf = await (new rConvert.RespecToEPUB(trace, packageOnly)).create_epub(url, fill_default_options(options));
            } else {
                throw "The URL should refer to an (X)HTML or a JSON content"
            }
            return the_ocf;
        } else {
            throw "The URL must end with '.(x)html', '.json', or the '/' character";
        }
    } else {
        throw "No URL has been provided for the conversion";
    }
}

