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
Object.defineProperty(exports, "__esModule", { value: true });
// import { fetch_html, fetch_resource, fetch_type } from './lib/fetch';
// ================
// ================
/**
 *
 * Collect and pre-process the form parameters
 *
 * @async
 */
const submit = async () => {
    const save_book = (data, name) => {
        console.log("saving");
        const dataURL = URL.createObjectURL(data);
        const download = document.getElementById('download');
        download.href = dataURL;
        download.download = name;
        download.click();
    };
    try {
        // const the_form :HTMLFormElement = document.getElementById('main_form') as HTMLFormElement;
        const url = document.getElementById('url');
        const respec = document.getElementById('respec');
        const publishDate = document.getElementById('publishDate');
        const specStatus = document.getElementById('specStatus');
        const addSectionLinks = document.getElementById('addSectionLinks');
        const maxTocLevel = document.getElementById('maxTocLevel');
        if (!(url.value === null || url.value === '')) {
            const a = {
                url: url.value,
                respec: respec.value === 'true',
                config: {
                    publishDate: publishDate.value === '' ? undefined : publishDate.value,
                    specStatus: specStatus.value === 'null' ? undefined : specStatus.value,
                    addSectionLinks: addSectionLinks.value === 'null' ? undefined : addSectionLinks.value,
                    maxTocLevel: maxTocLevel.value === '' ? undefined : maxTocLevel.value,
                }
            };
            // Testing...!
            console.error(JSON.stringify(a, null, 4));
            // alert(JSON.stringify(a,null,4))
            // Testing the fetch and save mechanism
            try {
                // const data = await fetch_resource('http://localhost:8001/LocalData/icon.jpg');
                // const data = await lo('http://localhost:8001/LocalData/icon.jpg');
                const response = await fetch('https://www.ivan-herman.net/index.html');
                const data = await response.blob();
                console.log('got here');
                save_book(data, 'namivan.jpg');
            }
            catch (e) {
                console.log(`Something did not wor with fetch: ${e}`);
            }
            return;
        }
    }
    catch (e) {
        console.log(e);
        alert(`Exception raised... ${e}`);
    }
};
window.addEventListener('load', () => {
    const submit_button = document.getElementById('submit');
    submit_button.addEventListener('click', submit);
});
//# sourceMappingURL=browser.js.map