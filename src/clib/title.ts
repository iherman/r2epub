/**
 * ## Collection title page
 *
 * Creation of a title page for a collection. See [[create_title_page]] for the details.
 *
 * @packageDocumentation
 */

/**
 *
 */

import type * as cConvert from './convert.ts';
import * as utils         from '../lib/utils.ts';

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
      <p class="larger" id="editors">%%%EDITORS%%%</p>
      <p class="logo"><a href="http://www.w3.org/"><img alt="W3C main logo" src="Icons/w3c_main.png"/></a></p>
      <p class="copyright"><a href="http://www.w3.org/Consortium/Legal/ipr-notice#Copyright">Copyright</a>
      © of the original documents: <time id="cpdate" datetime="%%%%ISODATE%%%%">%%%DATE%%%</time> W3C<sup>®</sup> (<a href="http://www.mit.edu">MIT</a>, <a href="http://www.ercim.eu/">ERCIM</a>,
      <a href="http://www.keio.ac.jp/">Keio</a>, <a href="http://ev.buaa.edu.cn/">Beihang</a>).<br/>
      All right reserved. W3C <a href="http://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer">liability</a>,
      <a href="http://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks">trademark</a>,
      and <a href="http://www.w3.org/Consortium/Legal/copyright-documents">document use</a> rules apply.</p>
    </div>
  </body>
</html>
`

/**
 * Create the HTML content for a title page.
 *
 * The title originates from the JSON configuration; the editors and the date are collected from the chapters.
 *
 *
 * @param book - the full book data
 * @returns a text representation of the title xhtml file.
 */
export function create_title_page(book :cConvert.Collection) :string {
    return title_page
        .replace('%%%TITLE1%%%', utils.de_xml(book.title))
        .replace('%%%TITLE2%%%', utils.de_xml(book.title))
        .replace('%%%EDITORS%%%', book.editors.join('; '))
        .replace('%%%%ISODATE%%%%', book.date)
        .replace('%%%DATE%%%', utils.date_to_string(book.date));
}

