import * as jsdom from 'jsdom';


const package_content =`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" prefix="rendition: http://www.idpf.org/vocab/rendition/#">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:coverage>Package Rendering Metadata</dc:coverage>
    <dc:creator>Matt Garrish</dc:creator>
    <dc:creator>Ivan Herman</dc:creator>
    <dc:date>2021-11-19</dc:date>
    <dc:description>Tests on handling overflow content with the "rendition:flow" property set to "scrolled-continuous". The content should be presented as one continuous scrolling document.</dc:description>
    <dc:identifier id="pub-id">pkg-rendition-scrolled-continuous</dc:identifier>
    <dc:language>en</dc:language>
    <dc:title>Rendition set to scrolled-continuous</dc:title>
    <link rel="dcterms:rights" href="https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document"/>
    <link rel="dcterms:rightsHolder" href="https://www.w3.org"/>
    <meta property="belongs-to-collection">should</meta>
    <meta property="dcterms:isReferencedBy">https://www.w3.org/TR/epub-33/#scrolled-continuous</meta>
    <meta property="dcterms:isReferencedBy">https://www.w3.org/TR/epub-rs-33/#scrolled-continuous</meta>
    <meta property="dcterms:modified">2021-11-19T00:00:00Z</meta>
    <meta property="rendition:flow">scrolled-continuous</meta>
  </metadata>
  <manifest>
    <item href="xhtml/nav.xhtml" id="nav" media-type="application/xhtml+xml" properties="nav"/>
    <item href="xhtml/xhtml-001.xhtml" id="xhtml-001" media-type="application/xhtml+xml"/>
    <item href="xhtml/xhtml-002.xhtml" id="xhtml-002" media-type="application/xhtml+xml"/>
    <item href="xhtml/xhtml-003.xhtml" id="xhtml-003" media-type="application/xhtml+xml"/>
    <item href="xhtml/xhtml-004.xhtml" id="xhtml-004" media-type="application/xhtml+xml"/>
    <!-- secondary files -->
    <item id="css" href="css/base.css" media-type="text/css"/>
  </manifest>
  <spine>
    <itemref idref="xhtml-001"/>
    <itemref idref="xhtml-002"/>
    <itemref idref="xhtml-003"/>
    <itemref idref="xhtml-004"/>
  </spine>
</package>
`

const package_file = new jsdom.JSDOM(package_content, {
    contentType : "application/xml",
}).window.document;

const items = package_file.getElementsByTagName('item')
for (let i=0; i < items.length; i++) {
    const item = items[i];
    const file_name = item.getAttribute('href')
    console.log(file_name);
}
