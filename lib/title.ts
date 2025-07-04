/**
 * ## Title page
 *
 * Creation of the title page.
 *
 * @packageDocumentation
 * @module
 */

/**
 *
 *
 */

import type { ResourceRef, Global } from './convert.ts';
import * as common                  from './common.ts';


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

      <p class="copyright"><a href="https://www.w3.org/policies/#copyright">Copyright</a> © <time id="cpdate" datetime="%%%%ISODATE%%%%">%%%DATE%%%</time>
      <a href="https://www.w3.org">World Wide Web Consortium</a>.
      W3C<sup>®</sup> <a href="https://www.w3.org/policies/#Legal_Disclaimer">liability</a>,
      <a href="https://www.w3.org/policies/#W3C_Trademarks">trademark</a>,
      and <a href="https://www.w3.org/copyright/software-license-2023/">permissive document use</a> rules apply.</p>
    </div>
  </body>
</html>
`

/**
 * Create the cover page: it is an XHTML file with title, editors, copyright information, and a disclaimer whereby the EPUB version of the document is not authoritative.
 *
 * @param global
 * @returns - resources for a start page, as well as long W3C logo (appearing on the cover page) and a relevant css file.
 */
export function create_title_page(global :Global) :ResourceRef[] {
    // The W3C long logo must be added to the overall resources
    const retval :ResourceRef[] = [
        {
            media_type   : 'image/png',
            relative_url : 'Icons/w3c_main.png',
            absolute_url : 'https://www.w3.org/Icons/w3c_main.png',
        },
        {
            media_type   : 'text/css',
            relative_url : 'StyleSheets/base.css',
            absolute_url : 'https://www.w3.org/StyleSheets/base.css',
        },
    ]

    const get_editors = () :string => global.config.editors
        // deno-lint-ignore no-explicit-any
        .map((entry: any) => entry.company !== undefined ? `${entry.name}, ${entry.company}` : `${entry.name}`)
        .join('; ');

    const title: string = global.html_element?.querySelector('title')?.textContent || '';
    const dateElement = global.html_element?.querySelector('time.dt-published');
    const [date, iso_date] = (() :[string, string] => {
        const theDate = (dateElement && dateElement.textContent) ? new Date(dateElement.textContent) : new Date();
        const doc_date     = theDate.getFullYear().toString();
        const doc_date_iso = theDate.toISOString();
        return [doc_date, doc_date_iso]
    })();

    const final_title_page = title_page
        .replace('%%%TITLE1%%%', title)
        .replace('%%%TITLE2%%%', title)
        .replace('%%%SUBTITLE%%%', dateElement?.parentElement?.innerHTML || '')
        .replace('%%%EDITORS%%%', get_editors())
        .replace('%%%ORIGINAL%%%', global.document_url)
        .replace('%%%%ISODATE%%%%', iso_date)
        .replace('%%%DATE%%%', date);

    retval.push({
        media_type   : common.media_types.xhtml,
        relative_url : 'title.xhtml',
        id           : 'title_page',
        text_content : final_title_page,
    })

    return retval.reverse();
}
