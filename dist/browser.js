"use strict";
/**
 * ## Browser interface
 *
 * Bridge between the HTML form and the conversion facilities. It relies on `<input>` elements with the `id` values set to
 * `url`, `respec`, `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel`.
 *
 * This script must be converted to Javascript and the browserified to be used in an HTML page.
 *
 * _**Beware: this module is temporarily out of order; there are some unexplained issues with browserify...**_
*
 * @packageDocumentation
*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 */
const convert = __importStar(require("./lib/convert"));
/**
 *
 * Generate the EPUB file. This is a wrapper around [[create_epub]], creating the necessary arguments [[Arguments]] structure based on the incoming form data.
 * The result is saved on the local disc, using the short name of the document.
 *
 * The method is set as an even handler for a submit button. The `event` argument is only used to prevent the default behavior of the button (i.e., to avoid reloading the page).
 *
 * @param event - Event object as forwarded to an HTML event handler.
 *
 * @async
 */
const submit = async (event) => {
    /**
     * The special trick to save a content, using an invisible `<a>` element, its 'download' attribute and a dataURL for the blob to be stored.
     * I found this trick somewhere on the Web...
     *
     * @param data
     * @param name
     */
    const save_book = (data, name) => {
        const dataURL = URL.createObjectURL(data);
        const download = document.getElementById('download');
        download.href = dataURL;
        download.download = name;
        download.click();
    };
    /**
     * Turn on, temporarily, the visibility of the 'EPUB file generated!!' text.
     */
    const fading_success = () => {
        done.style.setProperty('visibility', 'visible');
        setTimeout(() => done.style.setProperty('visibility', 'hidden'), 3000);
    };
    // This is to allow for async to work properly and avoid reloading the page
    event.preventDefault();
    const done = document.getElementById('done');
    const progress = document.getElementById('progress');
    try {
        const url = document.getElementById('url');
        const respec = document.getElementById('respec');
        const publishDate = document.getElementById('publishDate');
        const specStatus = document.getElementById('specStatus');
        const addSectionLinks = document.getElementById('addSectionLinks');
        const maxTocLevel = document.getElementById('maxTocLevel');
        if (!(url.value === null || url.value === '')) {
            const args = {
                url: url.value,
                respec: respec.value === 'true',
                config: {
                    publishDate: publishDate.value === '' ? undefined : publishDate.value,
                    specStatus: specStatus.value === 'null' ? undefined : specStatus.value,
                    addSectionLinks: addSectionLinks.value === 'null' ? undefined : addSectionLinks.value,
                    maxTocLevel: maxTocLevel.value === '' ? undefined : maxTocLevel.value,
                }
            };
            try {
                // turn on the progress bar at the bottom of the form
                progress.style.setProperty('visibility', 'visible');
                // Convert the content into a book, and create an EPUB instance as a Blob
                const conversion_process = new convert.RespecToEPUB(false, false);
                const the_ocf = await conversion_process.create_epub(args);
                const content = await the_ocf.get_content();
                // Save the Blob in  a file
                save_book(content, the_ocf.name);
                // // Remove the query string from the URL bar
                document.location.search = '';
                // Clean up the user interface and we are done!
                progress.style.setProperty('visibility', 'hidden');
                fading_success();
            }
            catch (e) {
                progress.style.setProperty('visibility', 'hidden');
                console.log(`EPUB Generation Error: ${e}`);
                alert(`EPUB Generation Error: ${e}`);
            }
        }
        else {
            alert(`No or empty URL value`);
        }
    }
    catch (e) {
        console.log(`Form interpretation Error... ${e}`);
        alert(`Form interpretation Error... ${e}`);
    }
};
window.addEventListener('load', () => {
    const submit_button = document.getElementById('submit');
    submit_button.addEventListener('click', submit);
});
//# sourceMappingURL=browser.js.map