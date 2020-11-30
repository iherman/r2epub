"use strict";
/**
 * ## Title page
 *
 * Creation of the title page.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_title_page = void 0;
const constants = __importStar(require("./constants"));
/**
 * The template to be used for the title page.
 * @hidden
 */
const title_page = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html lang="en-us" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <title>%%%TITLE1%%%</title>
    <link type="text/css" rel="stylesheet" href="StyleSheets/base.css" />
    <style type="text/css">
	  body {
		padding: 0 0 0 0 !important;
	  }

	  div[role~="main"] {
		padding: 2em 2em 2em 2em;
	  }
      h1 {
        text-align: center !important;
        font-size: 250%;
      }
      h2 {
        text-align: center !important;
        font-size: 140%;
        font-style: italic;
      }
      h3 {
        text-align: center !important;
        font-size: 140%;
        font-style: italic;
      }
      p.larger {
        font-size: 120%;
      }
      div#title {
        text-align: center;
        margin-top: 3em;
      }
      p.logo {margin-top:2em; text-align:center}
      p.disclaimer {
        font-style:italic;
      }
      ol { text-align: left !important;}
      a { text-decoration: none !important}

    </style>
  </head>
  <body>
    <div id="title" role="main">
      <h1 id="btitle">%%%TITLE2%%%</h1>
      <h2 id="subtitle">%%%SUBTITLE%%%</h2>
      <p class="larger" id="editors">%%%EDITORS%%%</p>
      <p class="logo"><a href="http://www.w3.org/"><img alt="W3C main logo" src="Icons/w3c_main.png"/></a></p>
      <p class="disclaimer">Note: this EPUB edition does <em>not</em> represent the authoritative text of the specification; please consult the <a id="%%%ORIGINAL%%%">original document</a> on the W3C Web Site.</p>
      <p class="copyright"><a href="http://www.w3.org/Consortium/Legal/ipr-notice#Copyright">Copyright</a>
      © of the original documents: <time id="cpdate" datetime="%%%%ISODATE%%%%">%%%DATE%%%</time> W3C<sup>®</sup> (<a href="http://www.mit.edu">MIT</a>, <a href="http://www.ercim.eu/">ERCIM</a>,
      <a href="http://www.keio.ac.jp/">Keio</a>, <a href="http://ev.buaa.edu.cn/">Beihang</a>).<br/>
      All right reserved. W3C <a href="http://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer">liability</a>,
      <a href="http://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks">trademark</a>,
      and <a href="http://www.w3.org/Consortium/Legal/copyright-documents">document use</a> rules apply.</p>
    </div>
  </body>
</html>
`;
/**
 * Create the cover page: it is an XHTML file with title, editors, copyright information, and a disclaimer whereby the EPUB version of the document is not authoritative.
 *
 * @param global
 * @returns - resources for a start page, as well as long W3C logo (appearing on the cover page) and a relevant css file.
 */
function create_title_page(global) {
    // The W3C long logo must be added to the overall resources
    const retval = [
        {
            media_type: 'image/png',
            relative_url: 'Icons/w3c_main.png',
            absolute_url: 'https://www.w3.org/Icons/w3c_main.png',
        },
        {
            media_type: 'text/css',
            relative_url: 'StyleSheets/base.css',
            absolute_url: 'https://www.w3.org/StyleSheets/base.css',
        },
    ];
    const get_editors = () => global.config.editors
        .map((entry) => entry.company !== undefined ? `${entry.name}, ${entry.company}` : `${entry.name}`)
        .join('; ');
    const title = global.html_element.querySelector('title').textContent;
    const date = global.html_element.querySelector('time.dt-published');
    const final_title_page = title_page
        .replace('%%%TITLE1%%%', title)
        .replace('%%%TITLE2%%%', title)
        .replace('%%%SUBTITLE%%%', date.parentElement.innerHTML)
        .replace('%%%EDITORS%%%', get_editors())
        .replace('%%%ORIGINAL%%%', global.document_url)
        .replace('%%%%ISODATE%%%%', date.getAttribute('datetime'))
        .replace('%%%DATE%%%', date.textContent);
    retval.push({
        media_type: constants.media_types.xhtml,
        relative_url: 'title.xhtml',
        id: 'title_page',
        text_content: final_title_page,
    });
    return retval.reverse();
}
exports.create_title_page = create_title_page;
//# sourceMappingURL=title.js.map