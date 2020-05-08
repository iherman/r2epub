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

/**
 *
 *
 */

import * as convert from './lib/convert';
import * as ocf from './lib/ocf';

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
const submit = async (event :Event) :Promise<any> => {
    /**
     * The special trick to save a content, using an invisible `<a>` element, its 'download' attribute and a dataURL for the blob to be stored.
     * I found this trick somewhere on the Web...
     *
     * @param data
     * @param name
     */
    const save_book = (data: Blob, name :string) => {
        const dataURL  = URL.createObjectURL(data);
        const download = document.getElementById('download') as HTMLAnchorElement;
        download.href  = dataURL;
        download.download = name;
        download.click();
    };

    /**
     * Turn on, temporarily, the visibility of the 'EPUB file generated!!' text.
     */
    const fading_success = () => {
        done.style.setProperty('visibility', 'visible');
        setTimeout(() => done.style.setProperty('visibility', 'hidden'), 3000);
    }

    // This is to allow for async to work properly and avoid reloading the page
    event.preventDefault();
    const done :HTMLElement             = document.getElementById('done');
    const progress :HTMLProgressElement = document.getElementById('progress') as HTMLProgressElement;

    try {
        const url :HTMLInputElement = document.getElementById('url') as HTMLInputElement;
        const respec :HTMLInputElement = document.getElementById('respec') as HTMLInputElement;
        const publishDate :HTMLInputElement = document.getElementById('publishDate') as HTMLInputElement;
        const specStatus :HTMLInputElement = document.getElementById('specStatus') as HTMLInputElement;
        const addSectionLinks :HTMLInputElement = document.getElementById('addSectionLinks') as HTMLInputElement;
        const maxTocLevel :HTMLInputElement = document.getElementById('maxTocLevel') as HTMLInputElement;

        if (!(url.value === null || url.value === '')) {

            const args :convert.Arguments  = {
                url    : url.value,
                respec : respec.value === 'true',
                config : {
                    publishDate     : publishDate.value === '' ? undefined : publishDate.value,
                    specStatus      : specStatus.value === 'null' ? undefined : specStatus.value,
                    addSectionLinks : addSectionLinks.value === 'null' ? undefined : addSectionLinks.value,
                    maxTocLevel     : maxTocLevel.value === '' ? undefined : maxTocLevel.value,
                }
            }

            try {

                // turn on the progress bar at the bottom of the form
                progress.style.setProperty('visibility', 'visible');

                // Convert the content into a book, and create an EPUB instance as a Blob
                const conversion_process   = new convert.RespecToEPUB(false, false);
                const the_ocf :ocf.OCF     = await conversion_process.create_epub(args);
                const content :Blob        = await the_ocf.get_content() as Blob;

                // Save the Blob in  a file
                save_book(content, the_ocf.name);

                // // Remove the query string from the URL bar
                document.location.search = '';

                // Clean up the user interface and we are done!
                progress.style.setProperty('visibility', 'hidden');
                fading_success();
            } catch(e) {
                progress.style.setProperty('visibility', 'hidden');
                console.log(`EPUB Generation Error: ${e}`);
                alert(`EPUB Generation Error: ${e}`);
            }
        } else {
            alert(`No or empty URL value`);
        }
    } catch(e) {
        console.log(`Form interpretation Error... ${e}`);
        alert(`Form interpretation Error... ${e}`);
    }
}

window.addEventListener('load', () => {
    const submit_button = document.getElementById('submit');
    submit_button.addEventListener('click', submit);
});
