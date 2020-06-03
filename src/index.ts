/**
 * ## Externally accessible entries
 *
 * r2epub can be used as a library module both for TypeScript and for Javascript. The external entities are listed below; see their respective documentations for further information.
 *
 * The top level functional entry point to the package is [[convert]].
 *
 * @packageDocumentation
*/

/**
 *
 *
 */

import * as constants  from './lib/constants';
import * as ocf        from './lib/ocf';
import * as rConvert   from './lib/convert';
import * as cConvert   from './clib/convert';
import * as fetch      from './lib/fetch';


/**
 * Convenience class, to export the [[rConvert.RespecToEPUB]] class for the package as a whole
 */
export class RespecToEPUB  extends rConvert.RespecToEPUB {};

/**
 * Convenience class, to export the [[ocf.OCF]] class for the package as a whole
 */
export class OCF extends ocf.OCF {};


/**
 * Config options, to be used as part of the input arguments in [[Arguments]] to overwrite the `config` options of ReSpec.
 * (See [ReSpec editor's guide](https://github.com/w3c/respec/wiki/ReSpec-Editor's-Guide).)
 *
 * Note that the interface definition does not restrict the possible values; however, not
 * all values are usable by overwriting the original values on-the-fly. The CLI for the package (see [[cli]]) defines a few useful values.
 */
interface ConfigOptions {
    [x :string] :string
}

/**
 * Arguments used by the for the conversion.
 *
 * The original content file may have to be run through the W3C [spec generator service](https://labs.w3.org/spec-generator/)
 * before further processing. If that is the case (see [[Arguments.respec]]), it is also possible to set some of the ReSpec configuration options,
 * overwriting the values set in the `config` entry of the original file (see [[Arguments.config]]). See the
 * [ReSpec editor's guide](https://github.com/w3c/respec/wiki/ReSpec-Editor's-Guide) for details of the values.
 *
 * The `url` field of the may also refer to a JSON file, which is then interpreted as the configuration of a full [[cConvert.Collection]]. If that is the case, all other fields of this data
 * structure are ignored, overwritten by the JSON based configuration. That
 *
 */
export interface Arguments {
    /** The URL of the relevant HTML or JSON file. If the latter, the JSON file must be a configuration file for a full Collection, and the other fields are ignored. */
    url     :string,
    /**
     * Is the source in ReSpec?
     */
    respec  :boolean,
    /**
     * Collection of respec config options, to be used with the spec generator (if applicable).
     */
    config  :ConfigOptions
}

/**
 * The top level entry in the package: convert a single Respec file, or a collection thereof, into an EPUB document.
 *
 * @async
 * @param document structure describing the structure of a single Respec file or, if the `url` field refers to a JSON file, a pointer to a configuration file of a Collection.
 * @param t whether tracing is set (for debugging)
 * @param p whether the package stops at the creation of an EPUB content and displays the content of the OPF file itself (for debugging)
 */
export async function convert(document: Arguments, t :boolean = false, p :boolean = false) :Promise<OCF> {
    // At the minimum, the URL part of the Arguments should exist, better check this
    if (document.url) {
        // If the URL refers to a JSON file, it is the configuration file for a full collection.
        let the_ocf :ocf.OCF;
        const media_type :string = await fetch.fetch_type(document.url);
        if (media_type === constants.media_types.json) {
            the_ocf = await cConvert.create_epub(document.url, t, p);
        } else {
            the_ocf = await (new rConvert.RespecToEPUB(t, p)).create_epub(document);
        }
        return the_ocf;
    } else {
        throw "No URL has been provided for the conversion"
    }
}

