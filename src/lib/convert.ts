/* eslint-disable max-lines-per-function */
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

/**
 *
 *
 */


import * as jsdom      from 'jsdom';
import * as _          from 'underscore';
import * as urlHandler from 'url';

import { fetch_html, fetch_resource, fetch_type } from './fetch';
import {Options}       from '../index';
import * as common     from './common';
import * as opf        from './opf';
import * as ocf        from './ocf';
import * as css2016    from './css2016';
import * as css2021    from './css2021';
import * as title_page from './title';
import * as cover_page from './cover';
import * as nav        from './nav';
import * as overview   from './overview';


// ========================================================== The main conversion part ============================================ //

/**
 * Interface for the resources that, eventually, should be added to the EPUB file
 */
export interface ResourceRef {
    /** The URL to be used within the EPUB; relative to the top of the file */
    relative_url :string,

    /** Media type of the resource; this must be added to the package manifest entry */
    media_type :string,

    /** URL of the resource in case it must be fetched */
    absolute_url? :string,

    /** Content of the resource in case it is generated by this program */
    text_content? :string,

    /** The item must have a fixed id, rather than a generated one */
    id? :string,

    /** Extra properties, defined by the package specification, to be added to the entry */
    properties? :string

    /** Flag whether the resource reference should also be added to the spine with a 'linear=no' attribute */
    add_to_spine? :boolean
}


/** Interface of the "Global" data, to be used by various utilities */
export interface Global {
    /** The URL of the document to be processed */
    document_url? :string,

    /** The DOM element, as returned from parsing */
    dom? : jsdom.JSDOM,

    /** The DOM HTML element of the main document */
    html_element? :Element,

    /**
     * The  initial config object, originally filled by the user (respec puts a copy of this
     * object, as JSON, into the header of the generated content.
    */
    config? :any,

    /**
     * Process version used to generate this file. The possible values are 2016 and 2021
    */
    process_version? :number,

    /**
     * [Debug] Whether trace information should be printed to the console
     */
    trace? :boolean

    /**
     * [Debug] Whether the opf instance should be should be printed to the console instead of generating an EPUB file
     */
    package? :boolean

    /**
     * The class used for the generation of the EPUB opf file
     */
    opf_content? :opf.PackageWrapper

    /**
     * List of extra resources, to be added to the opf file and into the final EPUB file. The main role of the [[create_epub_from_dom]]
     * function is to collect all relevant resources; once done, this array is used to generate the final
     * [`package.opf`](https://www.w3.org/TR/epub-33/#sec-package-doc) file
     * as well as to collect the resources themselves and add them to the final epub file.
     */
    resources? :ResourceRef[]
}

/**
 * Interface for the HTML DOM elements, to be considered for possible internal references.
 *
 */
interface LocalLinks {
    /** CSS selector to locate the right DOM elements */
    query :string,
    /** Attribute name to extract the resource URL */
    attr :string
}


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
 * * Create a title page. (See the [title module](./_lib_title_.html).)
 * * Create a cover image. (See the [cover module](./_lib_cover_.html).)
 * * Extract OPF properties from the original HTML content to be added to spine entries. (See the [“overview” module](./_lib_overview_.html).)
 * * Modify the DOM tree to abide to some specificities of reading systems (like Apple’s Books) and convert the result content into XHTML. (See the [“overview” module](./_lib_overview_.html).)
 * * Create the package (OPF) file with the right resource and spine entries. (See the [“opf” module](./_lib_opf_.html).)
 * * Create the OCF file (i.e., the final EPUB instance) containing all the resources collected and created in the previous steps. (See the [“ocf” module](./_lib_ocf_.html).)
 *
*/
export class RespecToEPUB {
    /**
     * Arrays of query/attribute pairs that may refer to a resource to be collected:
     *
     * - image, audio, and video, elements
     * - `a` elements
     * - links to stylesheets and scripts
     * - `object` elements
     *
     */
    private resource_references :LocalLinks[] = [
        {
            query : 'img, script, audio, video, source',
            attr  : 'src',
        },
        {
            query : 'a, link[rel="stylesheet"]',
            attr  : 'href',
        },
        {
            query : 'object',
            attr  : 'data',
        },
    ]

    private global :Global;

    private global_url :string;

    constructor(trace = false, print_package = false) {
        this.global = {
            trace     : trace,
            package   : print_package,
            resources : [],
        }
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
     * @param options - Reference to the original document; this may have to be transformed by respec on-the-fly.
     * @async
     */
    async create_epub(url: string, options: Options) :Promise<ocf.OCF> {
        /** Generate the URL used to get the final document DOM */
        const full_url = () => {
            if (options.respec) {
                // Yep, the content has to go through the respec transformation service
                // Collect the possible query parameters to control some details of the respec transformation
                const config_options :string[] = _.keys(options.config)
                    .map( (key :string) :string => {
                        if (options.config[key] === null || options.config[key] === '' || options.config[key] === 'null') {
                            return null;
                        } else {
                            return `${key}%3D${options.config[key]}`
                        }
                    })
                    .filter((val) => val !== null);
                const query_string = config_options.length === 0 ? '' : `%3F${config_options.join('%26')}`;
                return `${common.spec_generator}${url}${query_string}`
            } else {
                return url;
            }
        }

        if (this.global.trace) console.log(`Input arguments: ${url}, ${JSON.stringify(options)}`);

        // Fetch the real content (with a possible respec transformation) as a DOM tree for further processing
        const fetch_url = full_url();
        if (this.global.trace) console.log(`URL for the spec to be fetched: ${fetch_url}`);
        const dom :jsdom.JSDOM = await fetch_html(fetch_url);

        return await this.create_epub_from_dom(url, dom);
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
     * 7. Create a title page.
     * 8. Create a cover image.
     * 9. Create a nav file.
     * 10. Main resource (i.e., Overview.xhtml) entry, with relevant properties.
     * 11. Finalize the package file based on the collected resources in [[Global.resources]].
     * 12. Download all resources into the EPUB file.
     *
     *
     * All the resource entries are first collected in the in a [[Global.resources]] array, to be then added to the
     * [`package.opf`](https://www.w3.org/TR/epub-33/#sec-package-doc) file as well as to download
     * the resources into the final epub result (see the last two steps above).
     *
     * @param url - The url of the document (serves also as a base for all the other resources)
     * @param dom - The DOM of the final format of the document (i.e., the original document may have gone through a respec processing...)
     * @param debug - Debug options, see [[DebugOptions]]. Initialized to no debug
     * @returns - The zip archive with the epub content, i.e., an OCF instance
     * @async
     */
    async create_epub_from_dom(url :string, dom :jsdom.JSDOM) :Promise<ocf.OCF> {
        // ------------------------------------------
        // 1. Get hold of the local information
        this.global.dom = dom;
        this.global.html_element = dom.window.document.documentElement;
        this.global.document_url = url;

        {
            // Get hold of the configuration information
            const initial_config_element = this.global.html_element.querySelector("script#initialUserConfig") as HTMLScriptElement;
            if ( initial_config_element === null ) {
                throw "User config is not available"
            } else {
                // Some constants depend on the process version 2016 vs. 2021, which is decided
                // based on the date of the publication.
                this.global.config = JSON.parse(initial_config_element.textContent);
                if (!this.global.config.publishDate) {
                    this.global.config.publishDate = this.global.config.publishISODate.split('T')[0];
                }
                if (this.global.trace) console.log(`PublishDate: ${this.global.config.publishDate}`);
                common.finalize_style_constants(this.global.config);
            }
            if (this.global.trace) console.log(`global config set`);
        }

        // ------------------------------------------
        // 2. Add the basic metadata (authors, dates) to the opf file
        {
            // Create the package content, and populate it with the essential metadata using the configuration
            const title = this.global.html_element.querySelector('title').textContent;
            this.global_url = `https://www.w3.org/TR/${this.global.config.shortName}/`;
            this.global.opf_content = new opf.PackageWrapper(this.global_url, title);
            this.global.opf_content.add_creators(
                this.global.config.editors.map((entry: any) => entry.company !== undefined ? `${entry.name}, ${entry.company}` : `${entry.name}`),
            );

            const date = this.global.html_element.querySelector('time.dt-published');
            this.global.opf_content.add_dates(date.getAttribute('datetime'));
            if (this.global.trace) console.log(`global metadata set`);
        }

        // ------------------------------------------
        // 3. Collect all the extra resources from the Overview.html file
        this.global.resources = await this.get_extra_resources();

        // ------------------------------------------
        // 4. Add the reference to the W3C logo
        {
            const logo_element = this.global.html_element.querySelector('img[alt="W3C"]');
            if (logo_element !== null) {
                // This is set by respec and must be removed, otherwise the RS will not display the logo properly
                logo_element.removeAttribute('crossorigin');

                const relative_url =  `${common.local_style_files}logos/W3C.svg`;
                logo_element.setAttribute('src', relative_url);
                // There is an ugly story here. The SVG version of the logo, as stored on the W3C site, includes a reference
                // the very complex SVG DTD, and epubcheck does not like it (EPUB v. 3 does not like it). So
                // I created a version of the logo without it and stored it at a fix URL...
                // Note that EPUB 3.3 solved this issue, and so does epubcheck's version for EPUB 3.3.
                // The 2016 version of this code went out of its way to get around this issue (a number of SVG files for logos
                // were modified for local use). The 2021 version of the code does not care too much (in preparation for
                // EPUB 3.3) but the code below is valid for both versions...
                this.global.resources.push({
                    relative_url : relative_url,
                    media_type   : common.media_types.svg,
                    absolute_url : `${common.modified_epub_files}W3C_logo.svg`,
                })
            }
        }
        // 4.bis Add reference to the Member submission logo, if applicable
        {
            const logo_element = this.global.html_element.querySelector('img[alt="W3C Member Submission"]');
            if (logo_element !== null) {
                // This is set by respec and must be removed, otherwise the RS will not display the logo properly
                logo_element.removeAttribute('crossorigin');
                const relative_url =  `${common.local_icons}member_subm-v.svg`;
                logo_element.setAttribute('src', relative_url);
                this.global.resources.push({
                    relative_url : relative_url,
                    media_type   : common.media_types.svg,
                    absolute_url : `${common.modified_epub_files}member_subm-v.svg`,
                })
            }
        }

        // ------------------------------------------
        // 5. Remove the generic fixup script. Its role is (1) to set the warning popup for the outdated specs and (2) set
        // the width of the display to, possibly, put the TOC onto the sidebar. Both are unnecessary and, actually,
        // (2) is problematic because it forces a narrow display of the text that we do not want.
        {
            const fixup_element = this.global.html_element.querySelector(`script[src="${common.fixup_js}"]`);
            if (this.global.trace) console.log(`Got the the reference to the fixup script ${fixup_element} with url ${common.fixup_js}`);
            fixup_element.remove();
        }

        // ------------------------------------------
        // 6. Add some of the global W3C CSS files, and auxiliary image files
        // (Using a switch because, I'm afraid, there will be more changes in the future...)
        switch (common.process_version) {
            case 2016:
                this.global.resources = [...this.global.resources, ...css2016.extract_css(this.global)];
                break;
            case 2021:
            default:
                this.global.resources = [...this.global.resources, ...css2021.extract_css(this.global)];
                break;
        }

        // ------------------------------------------
        // 7. Create a title page
        this.global.resources = [...title_page.create_title_page(this.global), ...this.global.resources];

        // ------------------------------------------
        // 8. Create the cover image
        this.global.resources = [...cover_page.create_cover_image(this.global), ...this.global.resources];

        // ------------------------------------------
        // 9. Create a nav file
        this.global.resources = [...nav.create_nav_file(this.global), ...this.global.resources];

        // ------------------------------------------
        // 10. Add main resource (i.e., Overview.xhtml) entry, with relevant properties
        this.global.resources = [...overview.generate_overview_item(this.global), ...this.global.resources];

        // ------------------------------------------
        // 11. Finalize the package file
        {
            // Add the WCAG conformance, if applicable
            if (common.wcag_checked.includes(this.global.config.specStatus)) this.global.opf_content.add_wcag_link();

            // Populate the global package with the resource items
            let res_id_num = 1;
            this.global.resources.forEach((resource) => {
                if (resource.relative_url) {
                    this.global.opf_content.add_manifest_item({
                        "@href"       : resource.relative_url,
                        "@media-type" : resource.media_type,
                        "@id"         : resource.id || `res_id${res_id_num}`,
                        "@properties" : resource.properties,
                    }, resource.add_to_spine || false);
                    res_id_num += 1;
                }
            })
        }

        // There is a tiny debug branch at this point...
        if (this.global.package) {
            console.log(this.global.opf_content.serialize());
            return {} as ocf.OCF;
        } else {
            // 11. Download all resources into the EPUB file
            const retval :ocf.OCF = await this.generate_epub();
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
    private async get_extra_resources(): Promise<ResourceRef[]> {
        interface ToSpine {
            [ref: string] :boolean;
        }
        const to_spine :ToSpine = {};

        // Set the global URL used to 'globalize' links stemming from a <a> element, if necessary.
        let global_url :string;
        const parsed_document_url = urlHandler.parse(this.global.document_url);
        // Check whether the document url is on localhost or other, invalid host name
        if (common.invalid_host_names.includes(parsed_document_url.hostname)) {
            // check if the global url is there, using a fallback if not
            global_url = this.global_url || this.global.document_url;
        } else {
            // If not a localhost then the invocation URL should prevail
            global_url = this.global.document_url;
        }

        // Collect the set of resources from relative links in the source
        // The 'resource_references' array gives the pair of CSS query and attribute names to consider as
        // local resources. Those are collected in one array.
        const target_urls = _.chain(this.resource_references)
            // extract the possible references
            // Note that the map below generated an array of arrays; separate for images, objects, <a> elements, etc
            .map((ref :LocalLinks) => {
                // Get all the link type elements from the the HTML source.
                let candidates :HTMLElement[] = Array.from(this.global.html_element.querySelectorAll(ref.query));
                candidates = candidates.filter((element :HTMLElement) :boolean => {
                    if (element.tagName === 'A' && element.hasAttribute('href')) {
                        // Due to the constraints in EPUB 3, management of the 'a' values with relative URL-s deserve special attention
                        // In general, the rule is that such entries should also be added to the spine element; if not yet there then
                        // with a linear='no' attribute set. However, that works for types that are valid content documents, ie, HTML or SVG.
                        // Furthermore, HTML files should be converted to XHTML and checked for the same issues...
                        // There is also a special case, whereby the reference refers to its own alternate epub file; to avoid recursive setting, this link is simple removed
                        // Pragmatically, and based on the practice with real-life TR documents, we do here the following
                        // 1. if the relative URL refers to an SVG content, the content is added to the spine with linear=false
                        // 2. for all other cases the relative URL is turned into absolute.
                        const href = element.getAttribute('href');
                        const parsed = urlHandler.parse(href);
                        // 1. check whether this is a relative URL:
                        if (parsed.protocol === null && parsed.path !== null) {
                            // check if this refers to an alternate epub
                            if (element.getAttribute('rel') === 'alternate' && href.endsWith('.epub')) {
                                // this refers to an alternate epub
                                element.removeAttribute('href');
                                const text_content = element.textContent;
                                element.replaceWith(text_content);
                                return false;
                            } else if (href.endsWith('.svg') || href.endsWith('.svgz')) {
                                to_spine[href] = true;
                                return true;
                            } else {
                                // turn the reference to an absolute URL, which means it can be removed from further processing
                                element.setAttribute('href', urlHandler.resolve(global_url, href));
                                return false;
                            }
                        } else {
                            // for the time being, we keep this URL, let the next steps in the chain take care of them
                            return true;
                        }
                    } else {
                        return true;
                    }
                });
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
                } else {
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

        const absolute_urls = relative_urls.map((ref :string) :string => urlHandler.resolve(this.global.document_url, ref));
        if (this.global.trace) console.log(`getting the resources' content types via a set of fetches`);
        const media_types   = await Promise.all(absolute_urls.map((url) => fetch_type(url)));
        if (this.global.trace) console.log(`Got the media types ${media_types}`);

        return _.zip(relative_urls, media_types, absolute_urls).map((entry: string[]) :ResourceRef => {
            return {
                relative_url : entry[0],
                media_type   : entry[1],
                absolute_url : entry[2],
                add_to_spine : to_spine[entry[0]] || false,
            }
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
    private async generate_epub(): Promise<ocf.OCF> {
        const the_book = new ocf.OCF(`${this.global.config.shortName}.epub`);

        // The OCF class adds the fixed file like mime type and such automatically.
        // Add the package to the archives, with a fixed name:
        the_book.append(this.global.opf_content.serialize(),'package.opf');

        // Add all the resources
        {
            // First, find the resources where the content is simply a text; this can be archived directly
            if (this.global.trace) console.log(`append locally generated contents to the epub file`);
            this.global.resources
                .filter((resource: ResourceRef): boolean => resource.text_content ? true : false)
                .forEach((resource: ResourceRef): void => the_book.append(resource.text_content, resource.relative_url));

            // Second, find the resources where the content must be fetched...
            const to_be_fetched = this.global.resources.filter((resource: ResourceRef): boolean => resource.absolute_url ? true : false);
            const file_names = to_be_fetched.map((resource :ResourceRef): string => resource.relative_url);
            const urls       = to_be_fetched.map((resource :ResourceRef): string => resource.absolute_url);

            if (this.global.trace) console.log(`fetch the external resources (${urls})`);
            const contents   = await Promise.all(urls.map((url: string): Promise<any> => fetch_resource(url)));
            if (this.global.trace) console.log(`append external resources to the epub file`);
            _.zip(contents, file_names).forEach((arg: [any,string]) :void => the_book.append(arg[0], arg[1]));
        }
        return the_book;
    }
}
