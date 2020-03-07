import * as jsdom      from 'jsdom';
import * as _          from 'underscore';
import * as urlHandler from 'url';

import { fetch_html, fetch_resource, fetch_type, html_media_type } from './fetch';
import { PackageWrapper } from './package';


interface ResourceRef {
    relative_url  :string,
    media_type    :string,
    absolute_url  :string
}


interface Global {
    html_element? :Element,
    config?       :any,
    package?      :PackageWrapper
    resources?    :ResourceRef[]
}

const global :Global = {};

interface LocalLinks {
    query :string,
    attr  :string
}
/** Arrays of query/attribute pairs that may refer to a resource to be collected */
const resource_references :LocalLinks[] = [
    {
        query : 'img',
        attr  : 'src'
    },
    {
        query : 'a',
        attr  : 'href'
    },
    {
        query : 'link[rel="stylesheet"]',
        attr  : 'href'
    },
    {
        query : 'object',
        attr  : 'data'
    }
]


export async function process(document_url: string) {
    // I use inner blocks to clearly separate the important steps
    {
        // get hold of the document as a DOM node.
        const dom :jsdom.JSDOM = await fetch_html(document_url);
        global.html_element = dom.window.document.documentElement;
    }

    {
        // Get hold of the configuration information
        const initial_config_element = global.html_element.querySelector("script#initialUserConfig") as HTMLScriptElement;
        if( initial_config_element === null ) {
            throw "User config is not available"
        } else {
            global.config = JSON.parse(initial_config_element.textContent);
        }
    }

    {
        // Create the package content, and populate it with the essential metadata using the configuration
        const title = global.html_element.querySelector('title').textContent;
        const identifier = `https://www.w3.org/TR/${global.config.shortName}/`;
        global.package = new PackageWrapper(identifier, title);
        global.package.add_creators(global.config.editors.map((entry: any) => `${entry.name}, ${entry.company}`));
        global.package.add_dates(global.config.publishISODate);
    }

    {
        // Collect the set of resources from relative links in the source
        // The 'resource_references' array gives the pair of CSS query and attribute names to consider as
        // local resources. Those are collected in one array.
        const target_urls = _.chain(resource_references)
            // extract the possible references
            .map((ref :LocalLinks) => {
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

        // Ensure that the list is duplication free
        // (Why couldn't I put this into the chain???)
        const relative_urls = _.uniq(target_urls);
        const absolute_urls = relative_urls.map((ref :string) :string => urlHandler.resolve(document_url, ref));
        const media_types = await Promise.all(absolute_urls.map((url) => fetch_type(url)));

        global.resources = _.zip(relative_urls, media_types, absolute_urls).map((entry: string[]) :ResourceRef => {
            return {
                relative_url : entry[0],
                media_type   : entry[1],
                absolute_url : entry[2],
            }
        });
    }

    {
        // Collect the special entries that must end up in the local resources: CSS files
        // This also means that the DOM must be changed from absolute URL-s to relative ones...

        // 'base' CSS file
        global.resources.push({
            relative_url : 'StyleSheets/TR/2016/base.css',
            media_type   : 'text/css',
            absolute_url : 'https://www.w3.org/StyleSheets/TR/2016/base.css'
        })

        // Document type specific CSS file
        global.html_element.querySelectorAll('link[rel="stylesheet"]').forEach((element) => {
            if (element.hasAttribute('href')) {
                const full_url = element.getAttribute('href');
                const parsed = urlHandler.parse(full_url);
                if (parsed.host === 'www.w3.org') {
                    // The first '/' parameter should be removed from the path!
                    const relative_url = parsed.path.slice(1) + '.css'

                    // Add it to the resource list
                    global.resources.push({
                        relative_url : relative_url,
                        media_type : 'text/css',
                        absolute_url : full_url
                    })

                    // modify the DOM
                    element.setAttribute('href', relative_url);
                 }
            }
        });

        // W3C logo
        const logo_element = global.html_element.querySelector('img[alt="W3C"');
        if (logo_element === null) {
            console.log("??????");
        } else {
            const relative_url = 'StyleSheets/TR/2016/logos/W3C.svg';
            logo_element.setAttribute('href', relative_url);
            global.resources.push({
                relative_url : relative_url,
                media_type   : 'image/svg+xml',
                absolute_url : 'https://www.w3.org/StyleSheets/TR/2016/logos/W3C'
            })
        }
    }




    {
        // Populate the global package with the additional resources
        let res_id_num = 1;
        global.resources.forEach((resource) => {
            global.package.add_manifest_item({
                "@href"       : resource.relative_url,
                "@media-type" : resource.media_type,
                "@id"         : `res_id${res_id_num}`
            });
            res_id_num++;
        })
    }

    console.log(global.package.serialize());




}



