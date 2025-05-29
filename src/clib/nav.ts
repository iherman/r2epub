/* eslint-disable no-irregular-whitespace */
/**
 * ## Collection Navigation page
 *
 * Creation of a collection navigation page. See [[create_nav_page]] for details
 *
 * @packageDocumentation
 */


/**
 *
 */

import * as jsdom         from 'jsdom';
import type * as cConvert from './convert.ts';
import * as utils         from '../lib/utils.ts';
import type { Chapter }   from './chapter.ts';


/**
 * Template of the XHTML file
 *
 * @hidden
 */
const nav  = `<?xml version="1.0"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
        <title>
            %%%Title%%% — Table of Contents
        </title>
        <link rel="stylesheet" type="text/css" href="StyleSheets/base.css" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style>
                :root {
                    --color: #707070;
                }
                body {
                    counter-reset: example figure issue;

                    /* Layout */
                    max-width: 50em;
                    margin: 0 auto;
                    padding: 1.6em 1.5em 2em 50px;
                    padding: 1.6em 1.5em 2em calc(26px + 1.5em);

                    /* Typography */
                    line-height: 1.5;
                    font-family: sans-serif;
                    widows: 2;
                    orphans: 2;
                    word-wrap: break-word;
                    overflow-wrap: break-word;

                    /* Colors */
                    color: var(--color);
                    background: white top left fixed no-repeat;
                    background-color: white;
                    background-size: 25px auto;
                }

                a {
                    text-decoration: none;
                    color: var(--color) !important;
                }

                h2.introductory {
                    text-align: center;
                }

                ol {
                    list-style-type: none;
                }


                ol > li > ol > li > ol > li > ol >li > ol {
                    display: none;
                }

                .part-title {
                    display: block;
                    font-size: 130%;
                    font-weight: bold;
                    font-style: italic;
                    text-align: center;
                    margin-top: 2em;
            }
        </style>
    </head>
    <body>
        <nav epub:type="toc" id="navigation" role="doc-toc">
        <h2 class="introductory" id="table-of-contents">%%%Title2%%% — Table of Contents</h2>
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
        const html = dom.window.document.documentElement.querySelector('nav#navigation > ol').innerHTML;
        // the link elements must be changed to refer to the relevant subdirectory!
        const html_final = html.replace(/"Overview.xhtml/g, `"${chapter.chapter_name}/Overview.xhtml`)
        return `<li class="part-title-li"><a class="part-title" href="${chapter.chapter_name}/Overview.xhtml">${chapter.title}</a><ol>${html_final}</ol></li>`;
    }

    const full_nav :string = book.chapters.map(get_nav_text).join('\n');
    const title = utils.de_xml(book.title);
    const return_value = nav.replace('%%%Title%%%', title).replace('%%%Title2%%%', title).replace('%%%TOC%%%', full_nav);
    return utils.remove_entities(return_value);
}
