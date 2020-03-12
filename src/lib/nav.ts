/**
 * Creation of the navigation file
 */
import { ResourceRef, Global } from './process';
import * as create_xhtml       from './create_xhtml';

const nav :string = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
        <title>
            %%%Title%%% — Contents
        </title>
        <meta name="date" />
        <link rel="stylesheet" type="text/css" href="StyleSheets/TR/base.css" />
        <meta charset="utf-8" />
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
        <nav epub:type="landmarks" id="landmarks">
          <ol epub:type="list">
            <li><a epub:type="bodymatter" href="Overview.xhtml">Begin reading</a></li>
            <li><a epub:type="toc" href="nav.xhtml">Table of Contents</a></li>
          </ol>
        </nav>
    </body>
</html>
`

export function create_nav_file(global :Global) :ResourceRef[] {
    const retval :ResourceRef[] = [];

    // extract the toc part from the HTMl
    const title  = global.html_element.querySelector('title').textContent;
    const toc_ol = global.html_element.querySelector('nav#toc');
    if (toc_ol === null) {
        throw "No TOC element???"
    }
    const final_nav = nav
        .replace('%%%Title%%%', title)
        .replace('%%%TOC%%%', toc_ol.innerHTML.replace(/href="#/g,'href="Overview.xhtml#'));

    retval.push({
        media_type   : 'application/html+xml',
        relative_url : 'nav.xhtml',
        id           : 'nav',
        properties   : 'nav',
        text_content : final_nav
    })

    return retval;
}
