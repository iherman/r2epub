/**
 * ## Navigation File
 *
 * Creation of the navigation file combining a template with the TOC fragment retrieved from the content DOM.
 *
 * @packageDocumentation
 */
import { ResourceRef, Global } from './convert';
import * as xhtml              from './xhtml';
import * as constants          from './constants';


/**
 * Template of the XHTML file
 *
 * @hidden
 */
const nav :string = `<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
        <title>
            %%%Title%%% — Contents
        </title>
        <link rel="stylesheet" type="text/css" href="StyleSheets/base.css" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style>
        ol {
            list-style-type: none;
        }
        </style>
    </head>
    <body>
        <nav epub:type="toc" id="toc">
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
    const retval :ResourceRef[] = [];

    // extract the toc part from the HTMl
    const title  = global.html_element.querySelector('title').textContent;
    const toc_ol = global.html_element.querySelector('nav#toc');
    if (toc_ol === null) {
        throw "No TOC element???"
    }

    // It seems that there are some bugs in the TOC generators which result in <ol> elements that are empty.
    // epubcheck is picky and flags these...
    const ols = Array.from(toc_ol.querySelectorAll('ol'));
    ols.forEach((ol_element :Element) => {
        if (ol_element.childElementCount === 0) {
            ol_element.remove()
        }
    })

    const final_nav = nav
        .replace('%%%Title%%%', title)
        .replace('%%%TOC%%%', toc_ol.innerHTML.replace(/href="#/g,'href="Overview.xhtml#'));

    retval.push({
        media_type   : constants.media_types.xhtml,
        relative_url : 'nav.xhtml',
        id           : 'nav',
        properties   : 'nav',
        text_content : xhtml.convert(final_nav)
    })

    return retval;
}
