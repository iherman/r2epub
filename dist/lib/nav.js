"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const xhtml = __importStar(require("./xhtml"));
/**
 * Template of the XHTML file
 *
 * @hidden
 */
const nav = `<?xml version="1.0"?>
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
`;
/**
 * Create a navigation file, and return the necessary resource (to be added to the overall set of resources).
 *
 * @param global - global data
 * @returns - Resource representing the nav.xhtml file
 */
function create_nav_file(global) {
    const retval = [];
    // extract the toc part from the HTMl
    const title = global.html_element.querySelector('title').textContent;
    const toc_ol = global.html_element.querySelector('nav#toc');
    if (toc_ol === null) {
        throw "No TOC element???";
    }
    // It seems that there are some bugs in the TOC generators which result in <ol> elements that are empty.
    // epubcheck is picky and flags these...
    const ols = Array.from(toc_ol.querySelectorAll('ol'));
    ols.forEach((ol_element) => {
        if (ol_element.childElementCount === 0) {
            ol_element.remove();
        }
    });
    const final_nav = nav
        .replace('%%%Title%%%', title)
        .replace('%%%TOC%%%', toc_ol.innerHTML.replace(/href="#/g, 'href="Overview.xhtml#'));
    retval.push({
        media_type: 'application/xhtml+xml',
        relative_url: 'nav.xhtml',
        id: 'nav',
        properties: 'nav',
        text_content: xhtml.convert_text(final_nav)
    });
    return retval;
}
exports.create_nav_file = create_nav_file;
//# sourceMappingURL=nav.js.map