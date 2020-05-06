"use strict";
/**
 * ## Main entry points
 *
 * This module contains the main external entry points for the EPUB conversion. These are:
 *
 * * Main processing steps for the creation of EPUB files: the [[RespecToEPUB]] class;
 * * A representation of the EPUB OCF instances (i.e., of the ZIP file for the final content): the [[OCF]] class;
 * * A representation of the EPUB “package”, i.e., the XML file providing the main manifest of the EPUB file: the [[PackageWrapper]] class.
 *
 *
 * @packageDocumentation
*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("underscore"));
const urlHandler = __importStar(require("url"));
const fetch_1 = require("./fetch");
const constants = __importStar(require("./constants"));
const opf = __importStar(require("./opf"));
const ocf = __importStar(require("./ocf"));
const css = __importStar(require("./css"));
const cover = __importStar(require("./cover"));
const nav = __importStar(require("./nav"));
const overview = __importStar(require("./overview"));
/**
 * ## Main Processing class
 *
 * Main processing steps for the creation of EPUB files. See the [[create_epub]] and [[create_epub_from_dom]] entry points for the details.
 *
 * On a high level, the task of creating the EPUB file consists of:
 *
 * * Collect all the dependent resources like images, scripts, css files, audio, video, etc, that are "part" of the specification. In practical terms that means all resources with a relative URL should be collected.
 * * Set the right CSS files. W3C TR documents refer (via absolute URL-s) to CSS files in `https://www.w3.org/StyleSheet/TR/2016/*`;
 *   these style files, and the related images, depend on the exact nature of the TR document: REC, WD, etc. All these should be collected/created as resources for the EPUB file. (See the [“css” module](./_lib_css_.html).)
 * * Follow similar actions for some system wide javascript files (although, at this moment, it is a single JS file that must be taken care of).
 * * Extract the various metadata items (title, editors, dates, etc.) for the package file.
 * * Remove the TOC from the TR document (i.e., making it `display:none`), extract that HTML fragment and put it into a separate `nav` file, per EPUB3 specification. (See the [“nav” module](./_lib_nav_.html).)
 * * Create a cover page. (See the [“cover” module](./_lib_cover_.html).)
 * * Extract OPF properties from the original HTML content to be added to spine entries. (See the [“overview” module](./_lib_overview_.html).)
 * * Modify the DOM tree to abide to some specificities of reading systems (like Apple’s Books) and convert the result content into XHTML. (See the [“overview” module](./_lib_overview_.html).)
 * * Create the package (OPF) file with the right resource and spine entries. (See the [“opf” module](./_lib_opf_.html).)
 * * Create the OCF file (i.e., the final EPUB instance) containing all the resources collected and created in the previous steps. (See the [“ocf” module](./_lib_ocf_.html).)
 *
*/
class RespecToEPUB {
    constructor(trace = false, print_package = false) {
        /**
         * Arrays of query/attribute pairs that may refer to a resource to be collected:
         *
         * - image, audio, and video, elements
         * - `a` elements
         * - links to stylesheets and scripts
         * - `object` elements
         *
         */
        this.resource_references = [
            {
                query: 'img, script, audio, video, source',
                attr: 'src'
            },
            {
                query: 'a, link[rel="stylesheet"]',
                attr: 'href'
            },
            {
                query: 'object',
                attr: 'data'
            }
        ];
        this.global = {
            trace: trace,
            package: print_package,
            resources: []
        };
    }
    /**
     * Create an EPUB 3.2, ie, an OCF file from the original content
     *
     * This function is a wrapper around [[create_epub_from_dom]]:
     *
     * 1. Creates the DOM, which means, possibly, the original content is ran through the respec processor (if necessary).
     * 2. Calls [[create_epub_from_dom]] to generate the OCF content.
     * 3. "Finalizes" the OCF content, i.e., dump everything to a file.
     *
     *
     * @param document - Reference to the original document; this may have to be transformed by respec on-the-fly.
     * @async
     */
    async create_epub(document) {
        /** Generate the URL used to get the final document DOM */
        const full_url = () => {
            if (document.respec) {
                // Yep, the content has to go through the respec transformation service
                // Collect the possible query parameters to control some details of the respec transformation
                const config_options = _.keys(document.config)
                    .map((key) => {
                    if (document.config[key] === null || document.config[key] === '' || document.config[key] === 'null') {
                        return null;
                    }
                    else {
                        return `${key}%3D${document.config[key]}`;
                    }
                })
                    .filter((val) => val !== null);
                const query_string = config_options.length === 0 ? '' : `%3F${config_options.join('%26')}`;
                return `${constants.spec_generator}${document.url}${query_string}`;
            }
            else {
                return document.url;
            }
        };
        if (this.global.trace)
            console.log(`Input arguments: ${JSON.stringify(document)}`);
        // Fetch the real content (with a possible respec transformation) as a DOM tree for further processing
        const fetch_url = full_url();
        if (this.global.trace)
            console.log(`URL for the spec to be fetched: ${fetch_url}`);
        const dom = await fetch_1.fetch_html(fetch_url);
        return await this.create_epub_from_dom(document.url, dom);
    }
    /**
     * Create an OCF instance from DOM representing the original content.
     *
     * 1. Gather all the global information ([[Global]]).
     * 2. Add the basic metadata (authors, dates) to the opf file.
     * 3. Collect all the resources (see [[resource_references]]); the relative urls and the media types are
     * collected in a global structure, to be added to the EPUB file and the opf file later.
     * 4. Add the reference to a W3C logo.
     * 5. Add the reference to the generic fixup script.
     * 6. Add some of the global W3C CSS files, and auxiliary image files.
     * 7. Create a cover file.
     * 8. Create a nav file.
     * 9. Main resource (i.e., Overview.xhtml) entry, with relevant properties.
     * 10. Finalize the package file based on the collected resources in [[Global.resources]].
     * 11. Download all resources into the EPUB file.
     *
     *
     * All the resource entries are first collected in the in a [[Global.resources]] array, to be then added to the
     * [`package.opf`](https://www.w3.org/publishing/epub32/epub-packages.html#sec-package-def) file as well as to download
     * the resources into the final epub result (see the last two steps above).
     *
     * @param url - The url of the document (serves also as a base for all the other resources)
     * @param dom - The DOM of the final format of the document (i.e., the original document may have gone through a respec processing...)
     * @param debug - Debug options, see [[DebugOptions]]. Initialized to no debug
     * @returns - The zip archive with the epub content, i.e., an OCF instance
     * @async
     */
    async create_epub_from_dom(url, dom) {
        // ------------------------------------------
        // 1. Get hold of the local information
        this.global.dom = dom;
        this.global.html_element = dom.window.document.documentElement;
        this.global.document_url = url;
        {
            // Get hold of the configuration information
            const initial_config_element = this.global.html_element.querySelector("script#initialUserConfig");
            if (initial_config_element === null) {
                throw "User config is not available";
            }
            else {
                this.global.config = JSON.parse(initial_config_element.textContent);
            }
            if (this.global.trace)
                console.log(`global config set`);
        }
        // ------------------------------------------
        // 2. Add the basic metadata (authors, dates) to the opf file
        {
            // Create the package content, and populate it with the essential metadata using the configuration
            const title = this.global.html_element.querySelector('title').textContent;
            const identifier = `https://www.w3.org/TR/${this.global.config.shortName}/`;
            this.global.opf_content = new opf.PackageWrapper(identifier, title);
            this.global.opf_content.add_creators(this.global.config.editors.map((entry) => `${entry.name}, ${entry.company}`));
            const date = this.global.html_element.querySelector('time.dt-published');
            this.global.opf_content.add_dates(date.getAttribute('datetime'));
            if (this.global.trace)
                console.log(`global metadata set`);
        }
        // ------------------------------------------
        // 3. Collect all the extra resources from the Overview.html file
        this.global.resources = await this.get_extra_resources();
        // ------------------------------------------
        // 4. Add the reference to the W3C logo
        {
            const logo_element = this.global.html_element.querySelector('img[alt="W3C"]');
            if (logo_element !== null) {
                const relative_url = `${constants.local_style_files}logos/W3C.svg`;
                logo_element.setAttribute('src', relative_url);
                // There is an ugly story here. The SVG version of the logo, as stored on the W3C site, includes a reference
                // the very complex SVG DTD, and epubcheck does not like it (EPUB v. 3 does not like it, I guess). So
                // I created a version of the logo without it and stored it at a fix URL...
                this.global.resources.push({
                    relative_url: relative_url,
                    media_type: constants.media_types.svg,
                    absolute_url: `${constants.modified_epub_files}W3C_logo.svg`
                });
            }
        }
        // ------------------------------------------
        // 5. Add the reference to the generic fixup script. I am not sure it is really necessary
        // but it may not harm...
        {
            const fixup_element = this.global.html_element.querySelector(`script[src="${constants.fixup_js}"]`);
            if (fixup_element !== null) {
                const relative_url = 'scripts/TR/2016/fixup.js';
                fixup_element.setAttribute('src', relative_url);
                this.global.resources.push({
                    relative_url: relative_url,
                    media_type: constants.media_types.js,
                    absolute_url: constants.fixup_js
                });
            }
        }
        // ------------------------------------------
        // 6. Add some of the global W3C CSS files, and auxiliary image files
        this.global.resources = [...this.global.resources, ...css.extract_css(this.global)];
        // ------------------------------------------
        // 7. Create a cover file
        this.global.resources = [...cover.create_cover_page(this.global), ...this.global.resources,];
        // ------------------------------------------
        // 8. Create a nav file
        this.global.resources = [...nav.create_nav_file(this.global), ...this.global.resources];
        // ------------------------------------------
        // 9. Add main resource (i.e., Overview.xhtml) entry, with relevant properties
        this.global.resources = [...overview.generate_overview_item(this.global), ...this.global.resources];
        // ------------------------------------------
        // 10. Finalize the package file
        {
            // Populate the global package with the resource item
            let res_id_num = 1;
            this.global.resources.forEach((resource) => {
                if (resource.relative_url) {
                    this.global.opf_content.add_manifest_item({
                        "@href": resource.relative_url,
                        "@media-type": resource.media_type,
                        "@id": resource.id || `res_id${res_id_num}`,
                        "@properties": resource.properties
                    });
                    res_id_num++;
                }
            });
        }
        // There is a tiny debug branch at this point...
        if (this.global.package) {
            console.log(this.global.opf_content.serialize());
            return {};
        }
        else {
            // 11. Download all resources into the EPUB file
            const retval = await this.generate_epub();
            return retval;
        }
    }
    /**
     * Collect the references to the extra resources, to be added to the EPUB file as well as the package opf file.
     * It relies on searching through the HTML source file, based on the query patterns given in [[resource_references]].
     *
     * The media type of all entries are established by issuing a HEAD request to the respective resource.
     *
     * @returns - list of additional resources
     * @async
     */
    async get_extra_resources() {
        // Collect the set of resources from relative links in the source
        // The 'resource_references' array gives the pair of CSS query and attribute names to consider as
        // local resources. Those are collected in one array.
        const target_urls = _.chain(this.resource_references)
            // extract the possible references
            .map((ref) => {
            const candidates = Array.from(this.global.html_element.querySelectorAll(ref.query));
            return candidates.map((element) => element.getAttribute(ref.attr));
        })
            // create one single array of the result (instead of an array or arrays)
            .flatten()
            // Remove absolute URL-s
            .filter((ref) => {
            if (ref !== '' && ref !== null) {
                const parsed = urlHandler.parse(ref);
                // Relative URL means that the protocol is null
                return parsed.protocol === null && parsed.path !== null;
            }
            else {
                return false;
            }
        })
            // Remove fragment part, if any
            .map((ref) => {
            const parsed = urlHandler.parse(ref);
            parsed.hash = null;
            return urlHandler.format(parsed);
        })
            .value();
        // Ensure that the list is duplicate free
        // (Why couldn't I put this into the chain???)
        const relative_urls = _.uniq(target_urls);
        const absolute_urls = relative_urls.map((ref) => urlHandler.resolve(this.global.document_url, ref));
        if (this.global.trace)
            console.log(`getting the resources' content types via a set of fetches`);
        const media_types = await Promise.all(absolute_urls.map((url) => fetch_1.fetch_type(url)));
        return _.zip(relative_urls, media_types, absolute_urls).map((entry) => {
            return {
                relative_url: entry[0],
                media_type: entry[1],
                absolute_url: entry[2],
            };
        });
    }
    /**
     * Create the final epub file (ie, an OCF instance): download all resources, if applicable, add them all, as well as the
     * generated content (package file, nav file, the original content file, etc.) to an OCF instance.
     *
     * The generated epub file name is `shortName.epub`.
     *
     * @async
     */
    async generate_epub() {
        const the_book = new ocf.OCF(`${this.global.config.shortName}.epub`);
        // The OCF class adds the fixed file like mime type and such automatically.
        // Add the package to the archives, with a fixed name:
        the_book.append(this.global.opf_content.serialize(), 'package.opf');
        // Add all the resources
        {
            // First, find the resources where the content is simply a text; this can be archived directly
            if (this.global.trace)
                console.log(`append locally generated contents to the epub file`);
            this.global.resources
                .filter((resource) => resource.text_content ? true : false)
                .forEach((resource) => the_book.append(resource.text_content, resource.relative_url));
            // Second, find the resources where the content must be fetched...
            const to_be_fetched = this.global.resources.filter((resource) => resource.absolute_url ? true : false);
            const file_names = to_be_fetched.map((resource) => resource.relative_url);
            const urls = to_be_fetched.map((resource) => resource.absolute_url);
            if (this.global.trace)
                console.log(`fetch the external resources`);
            const contents = await Promise.all(urls.map((url) => fetch_1.fetch_resource(url)));
            if (this.global.trace)
                console.log(`append external resources to the epub file`);
            _.zip(contents, file_names).forEach((arg) => the_book.append(arg[0], arg[1]));
        }
        return the_book;
    }
}
exports.RespecToEPUB = RespecToEPUB;
//# sourceMappingURL=convert.js.map