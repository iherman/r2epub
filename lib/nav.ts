/**
 * ## Navigation File
 *
 * Creation of the navigation file combining a template with the TOC fragment retrieved from the content DOM.
 *
 * @packageDocumentation
 */

/**
 *
 *
 */


import type { ResourceRef, Global } from './convert.ts';
import { to_xhtml }                 from './utils.ts';
import * as common                  from './common.ts';

/**
 * Template of the XHTML file
 *
 * @hidden
 */
const nav_template  = `<?xml version="1.0"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
        <title>
            %%%Title%%% — Contents
        </title>
        <link rel="stylesheet" type="text/css" href="StyleSheets/base.css" />
        <link rel="stylesheet" type="text/css" href="StyleSheets/TR/%%%process%%%/base.css" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style>
        ol {
            list-style-type: none;
        }
        </style>
    </head>
    <body>
        <nav epub:type="toc" id="navigation" role="doc-toc">
%%%TOC%%%
        </nav>
     </body>
</html>
`

/**
 * Create a navigation file, and return the necessary resource (to be added to the overall set of resources).
 *
 * The content of the original TOC element is serialized (using the `innerHTML` DOM method) and the result is added to a textual HTML template.
 * The only change on the original content is the replacement of the purely fragment URLs in the TOC with a relative URL to `Overview.xhtml`.
 *
 * @param global - global data
 * @returns - Resource representing the nav.xhtml file
 */
export function create_nav_file(global :Global) :ResourceRef[] {
    const output: ResourceRef = {
        media_type   : common.media_types.xhtml,
        relative_url : 'nav.xhtml',
        id           : 'nav',
        properties   : 'nav',
        text_content : "",
    }

    // extract the toc part from the HTML
    const title   = global.html_element?.querySelector('title')?.textContent || '';
    const toc_nav = global.html_element?.querySelector('nav#toc');
    if (toc_nav !== null && toc_nav !== undefined) {
        // It seems that there are some bugs in the TOC generators which result in empty <ol> elements.
        // epubcheck is picky and flags these...
        const ols = toc_nav.querySelectorAll('ol');
        if (ols.length !== 0) {
            let no_toc = true;
            (Array.from(ols) as Element[]).forEach((ol_element :Element) => {
                if (ol_element.childElementCount === 0) {
                    ol_element.remove()
                } else {
                    no_toc = false;
                }
            })

            const final_nav = ((): string => {
                if (no_toc) {
                    // This is a bit of a hack, but it is the only way to keep epubcheck happy.
                    // Necessary when the original document does not have a TOC at all.
                    return nav_template
                        .replace('%%%Title%%%', title)
                        .replace('%%%process%%%', `${common.process_version}`)
                        .replace('%%%TOC%%%', `<ol><li><a href="Overview.xhtml">${title}</a></li></ol>`);
                } else {
                    return nav_template
                        .replace('%%%Title%%%', title)
                        .replace('%%%process%%%', `${common.process_version}`)
                        .replace('%%%TOC%%%', toc_nav.innerHTML.replace(/href="#/g, 'href="Overview.xhtml#'));
                }
            })();


            output.text_content = to_xhtml(final_nav);
        }
        // Remove the toc element from the Overview.xhtml altogether. Although it would be enough
        // to rely on CSS to make this element non-displayed, it seems that there are some
        // older reading systems that do not implement that...
        toc_nav.remove();
    }

    return [output];
}
