"use strict";
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
const opf = __importStar(require("./opf"));
const css = __importStar(require("./css"));
const cover = __importStar(require("./cover"));
const nav = __importStar(require("./nav"));
const ocf = __importStar(require("./ocf"));
const overview = __importStar(require("./overview"));
/** URL of the spec generator service, used if the source has to be transformed first */
const spec_generator = 'https://labs.w3.org/spec-generator/?type=respec&url=';
/**
 * Arrays of query/attribute pairs that may refer to a resource to be collected:
 *
 * - image, audio, and video, elements
 * - `a` elements
 * - links to stylesheets and scripts
 * - `object` elements
 *
 */
const resource_references = [
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
 * @param cli_arguments
 * @async
 */
async function create_epub(cli_arguments) {
    /** Generate the URL used to get the final document DOM */
    const full_url = () => {
        if (cli_arguments.respec) {
            const config_options = _.keys(cli_arguments.config)
                .map((key) => {
                if (cli_arguments.config[key] === null) {
                    return null;
                }
                else {
                    return `${key}=${cli_arguments.config[key]}`;
                }
            })
                .filter((val) => val !== null);
            const query_string = config_options.length === 0 ? '' : `?${config_options.join('&')}`;
            return `${spec_generator}${cli_arguments.url}${query_string}`;
        }
        else {
            return cli_arguments.url;
        }
    };
    if (cli_arguments.trace)
        console.log(`Input arguments: ${JSON.stringify(cli_arguments)}`);
    const fetch_url = full_url();
    if (cli_arguments.trace)
        console.log(`URL for the spec to be fetched: ${fetch_url}`);
    const dom = await fetch_1.fetch_html(fetch_url);
    const ocf_instance = await create_epub_from_dom(cli_arguments.url, dom, { package: cli_arguments.package, trace: cli_arguments.trace });
    // There is a tiny debug branch at this point...
    if (cli_arguments.package === false) {
        // Finalize, i.e., put into a file, the OCF instance:
        await ocf_instance.finalize();
    }
}
exports.create_epub = create_epub;
/**
 * Create an OCF instance from the original content.
 *
 * 1. Gather all the global information ([[Global]]).
 * 2. Add the basic metadata (authors, dates) to the opf file.
 * 3. Collect all the resources (see [[resource_references]]); the relative urls and the media types are
 * collected in a global structure, to be added to the EPUB file and the opf file later.
 * 4. Add the reference to a W3C logo.
 * 5. Add the reference to the generic fixup script.
 * 6. Add some of the global W3C CSS files, and auxillary image files.
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
async function create_epub_from_dom(url, dom, debug = { package: false, trace: false }) {
    // ------------------------------------------
    // 1. Get hold of the local information
    const global = {
        dom: dom,
        html_element: dom.window.document.documentElement,
        document_url: url,
        trace: debug.trace,
        package: debug.package,
        resources: []
    };
    {
        // Get hold of the configuration information
        const initial_config_element = global.html_element.querySelector("script#initialUserConfig");
        if (initial_config_element === null) {
            throw "User config is not available";
        }
        else {
            global.config = JSON.parse(initial_config_element.textContent);
        }
        if (global.trace)
            console.log(`global config set`);
    }
    // ------------------------------------------
    // 2. Add the basic metadata (authors, dates) to the opf file
    {
        // Create the package content, and populate it with the essential metadata using the configuration
        const title = global.html_element.querySelector('title').textContent;
        const identifier = `https://www.w3.org/TR/${global.config.shortName}/`;
        global.opf_content = new opf.PackageWrapper(identifier, title);
        global.opf_content.add_creators(global.config.editors.map((entry) => `${entry.name}, ${entry.company}`));
        const date = global.html_element.querySelector('time.dt-published');
        global.opf_content.add_dates(date.getAttribute('datetime'));
        if (global.trace)
            console.log(`global metadata set`);
    }
    // ------------------------------------------
    // 3. Collect all the extra resources from the Overview.html file
    global.resources = await get_extra_resources(global);
    // ------------------------------------------
    // 4. Add the reference to the W3C logo
    {
        const logo_element = global.html_element.querySelector('img[alt="W3C"]');
        if (logo_element !== null) {
            const relative_url = 'StyleSheets/TR/2016/logos/W3C.svg';
            logo_element.setAttribute('src', relative_url);
            // There is an ugly story here. The SVG version of the logo, as stored on the W3C site, includes a reference
            // the very complex SVG DTD, and epubcheck does not like it (EPUB v. 3 does not like it, I guess). So
            // I created a version of the logo without it and stored it at a fix URL...
            global.resources.push({
                relative_url: relative_url,
                media_type: fetch_1.svg_media_type,
                absolute_url: 'https://www.w3.org/People/Ivan/TR_EPUB/W3C_logo.svg'
            });
        }
    }
    // ------------------------------------------
    // 5. Add the reference to the generic fixup script. I am not sure it is really necessary
    // but it may not harm...
    {
        const fixup_element = global.html_element.querySelector('script[src="https://www.w3.org/scripts/TR/2016/fixup.js"]');
        if (fixup_element !== null) {
            const relative_url = 'scripts/TR/2016/fixup.js';
            fixup_element.setAttribute('src', relative_url);
            global.resources.push({
                relative_url: relative_url,
                media_type: fetch_1.js_media_type,
                absolute_url: 'https://www.w3.org/scripts/TR/2016/fixup.js'
            });
        }
    }
    // ------------------------------------------
    // 6. Add some of the global W3C CSS files, and auxillary image files
    global.resources = [...global.resources, ...css.extract_css(global)];
    // ------------------------------------------
    // 7. Create a cover file
    global.resources = [...cover.create_cover_page(global), ...global.resources,];
    // ------------------------------------------
    // 8. Create a nav file
    global.resources = [...nav.create_nav_file(global), ...global.resources];
    // ------------------------------------------
    // 9. Add main resource (i.e., Overview.xhtml) entry, with relevant properties
    global.resources = [...overview.generate_overview_item(global), ...global.resources];
    // ------------------------------------------
    // 10. Finalize the package file
    {
        // Populate the global package with the resource item
        let res_id_num = 1;
        global.resources.forEach((resource) => {
            if (resource.relative_url) {
                global.opf_content.add_manifest_item({
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
    if (global.package) {
        console.log(global.opf_content.serialize());
        return {};
    }
    else {
        // 11. Download all resources into the EPUB file
        const retval = await generate_epub(global);
        return retval;
    }
}
exports.create_epub_from_dom = create_epub_from_dom;
/**
 * Collect the references to the extra resources, to be added to the EPUB file as well as the package opf file.
 * It relies on searching through the HTML source file, based on the query patterns given in [[resource_references]].
 *
 * The media type of all entries are established by issuing a HEAD request to the respective resource.
 *
 * @param global
 * @returns - list of additional resources
 * @async
 */
const get_extra_resources = async (global) => {
    // Collect the set of resources from relative links in the source
    // The 'resource_references' array gives the pair of CSS query and attribute names to consider as
    // local resources. Those are collected in one array.
    const target_urls = _.chain(resource_references)
        // extract the possible references
        .map((ref) => {
        const candidates = Array.from(global.html_element.querySelectorAll(ref.query));
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
    const absolute_urls = relative_urls.map((ref) => urlHandler.resolve(global.document_url, ref));
    if (global.trace)
        console.log(`getting the resources' content types via a set of fetches`);
    const media_types = await Promise.all(absolute_urls.map((url) => fetch_1.fetch_type(url)));
    return _.zip(relative_urls, media_types, absolute_urls).map((entry) => {
        return {
            relative_url: entry[0],
            media_type: entry[1],
            absolute_url: entry[2],
        };
    });
};
/**
 * Create the final epub file (ie, an OCF instance): download all resources, if applicable, add them all, as well as the
 * generated content (package file, nav file, the original content file, etc.) to an OCF instance.
 *
 * The generated epub file name is `shortName.epub`.
 *
 * @param global
 * @async
 */
const generate_epub = async (global) => {
    const the_book = new ocf.OCF(`${global.config.shortName}.epub`);
    // The OCF class adds the fixed file like mime type and such automatically.
    // Add the package to the archives, with a fixed name:
    the_book.append(global.opf_content.serialize(), 'package.opf');
    // Add all the resources
    {
        // First, find the resources where the content is simply a text; this can be archived directly
        if (global.trace)
            console.log(`append locally generated contents to the epub file`);
        global.resources
            .filter((resource) => resource.text_content ? true : false)
            .forEach((resource) => the_book.append(resource.text_content, resource.relative_url));
        // Second, find the resources where the content must be fetched...
        const to_be_fetched = global.resources.filter((resource) => resource.absolute_url ? true : false);
        const file_names = to_be_fetched.map((resource) => resource.relative_url);
        const urls = to_be_fetched.map((resource) => resource.absolute_url);
        if (global.trace)
            console.log(`fetch the external resources`);
        const contents = await Promise.all(urls.map((url) => fetch_1.fetch_resource(url)));
        if (global.trace)
            console.log(`append external resources to the epub file`);
        _.zip(contents, file_names).forEach((arg) => the_book.append(arg[0], arg[1]));
    }
    return the_book;
};
//# sourceMappingURL=process.js.map