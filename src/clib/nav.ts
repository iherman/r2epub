/**
 * ## Navigation page
 *
 * Creation of a navigation page. See [[create_nav_page]] for details
 *
 * @packageDocumentation
 */


 /**
  *
  */

import * as jsdom    from 'jsdom';
import * as cConvert from './convert';
import { Chapter }   from './chapter';


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
        <h2 class="introductory" id="table-of-contents">Table of Contents</h2>
        <ol>
%%%TOC%%%
        </ol>
        </nav>
     </body>
</html>
`


/**
 * Create the HTML navigation page.
 *
 * The function gathers the real content of the chapters’ navigation pages, extracts real TOC portions and puts together all of them as one
 * large TOC structure. The result is added to a textual HTML template.
 *
 * Note that the links to the real content must be modified on the fly, because the original chapters are all put into a separate subdirectory.
 *
 * @param book - the full book data
 * @returns - a text representation of the nav xhtml file.
 */
export function create_nav_page(book :cConvert.Collection) :string {
    const get_nav_text = (chapter :Chapter) :string => {
        // Get the nav file from the chapter
        const dom  = new jsdom.JSDOM(chapter.nav);
        let html = dom.window.document.documentElement.querySelector('nav#toc > ol').innerHTML;
        // the link elements must be changed to refer to the relevant subdirectory!
        let html_final = html.replace(/"Overview.xhtml/g, `"${chapter.chapter_name}/Overview.xhtml`)
        return `<li><a href="${chapter.chapter_name}/Overview.xhtml">${chapter.title}</a><ol>${html_final}</ol></li>`;
    }

    const full_nav :string = book.chapters.map(get_nav_text).join('\n');
    return nav.replace('%%%Title%%%', book.title).replace('%%%TOC%%%',full_nav);
 }
