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

      <p class="disclaimer">Note: this EPUB edition does <em>not</em> represent the authoritative text of the specifications; please consult the original documents on the W3C Web Site.</p>

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
 * Create the HTML content for a title page.
 *
 * The title originates from the JSON configuration; the editors and the date are collected from the chapters.
 *
 *
 * @param book - the full book data
 * @returns a text representation of the title xhtml file.
 */
export function create_title_page(book :cConvert.Collection) :string {
    const [date, iso_date] = ((): [string, string] => {
        const theDate = (book.date) ? new Date(book.date) : new Date();
        const doc_date = theDate.getFullYear().toString();
        const doc_date_iso = theDate.toISOString();
        return [doc_date, doc_date_iso];
    })();
    return title_page
        .replace('%%%TITLE1%%%', utils.de_xml(book.title))
        .replace('%%%TITLE2%%%', utils.de_xml(book.title))
        .replace('%%%EDITORS%%%', book.editors?.join('; ') || '')
        .replace('%%%%ISODATE%%%%', iso_date)
        .replace('%%%DATE%%%', date);
}

