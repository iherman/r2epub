"use strict";
/**
 * ## Browser interface
 *
 * Bridge between the HTML form and the conversion facilities. It relies on `<input>` elements with the `id` values set to
 * `url`, `respec`, `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel`.
 *
 * This script must be converted to Javascript and the browserified to be used in an HTML page.
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
const conversion = __importStar(require("./lib/conversion"));
/**
 *
 * Generate the EPUB file. This is a wrapper around [[create_epub]], creating the necessary arguments [[Arguments]] structure based on the incoming form data.
 * The result is saved on the local disc, using the short name of the document.
 *
 * The method is set as an even handler for a submit button. The `event` argument is only used to prevent the default behavior of the button (i.e., to reload the page).
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
    // This is to allow for async to work properly and avoid reloading the page
    event.preventDefault();
    try {
        // const the_form :HTMLFormElement = document.getElementById('main_form') as HTMLFormElement;
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
            // console.log(`Call arguments:  ${JSON.stringify(args, null, 4)}`);
            try {
                const conversion_process = new conversion.RespecToEPUB(false, false);
                const the_ocf = await conversion_process.create_epub(args);
                const content = await the_ocf.get_content();
                save_book(content, the_ocf.name);
                alert(`“${the_ocf.name}” has been generated.`);
            }
            catch (e) {
                console.log(`EPUB Generation Error: ${e}`);
            }
        }
        else {
            alert(`No or empty URL value`);
        }
    }
    catch (e) {
        console.log(`Form interetation Error... ${e}`);
        alert(`Form interetation Error... ${e}`);
    }
};
window.addEventListener('load', () => {
    const submit_button = document.getElementById('submit');
    submit_button.addEventListener('click', submit);
});
//# sourceMappingURL=browser.js.map