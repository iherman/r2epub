"use strict";
/**
 * ## Collection Navigation page
 *
 * Creation of a collection navigation page. See [[create_nav_page]] for details
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_nav_page = void 0;
/**
 *
 */
const jsdom = __importStar(require("jsdom"));
const utils = __importStar(require("../lib/utils"));
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
        <h2 class="introductory" id="table-of-contents">Table of Contents</h2>
        <ol>
%%%TOC%%%
        </ol>
        </nav>
     </body>
</html>
`;
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
function create_nav_page(book) {
    const get_nav_text = (chapter) => {
        // Get the nav file from the chapter
        const dom = new jsdom.JSDOM(chapter.nav);
        let html = dom.window.document.documentElement.querySelector('nav#toc > ol').innerHTML;
        // the link elements must be changed to refer to the relevant subdirectory!
        let html_final = html.replace(/"Overview.xhtml/g, `"${chapter.chapter_name}/Overview.xhtml`);
        return `<li><a href="${chapter.chapter_name}/Overview.xhtml">${chapter.title}</a><ol>${html_final}</ol></li>`;
    };
    const full_nav = book.chapters.map(get_nav_text).join('\n');
    return nav.replace('%%%Title%%%', utils.de_xml(book.title)).replace('%%%TOC%%%', full_nav);
}
exports.create_nav_page = create_nav_page;
//# sourceMappingURL=nav.js.map