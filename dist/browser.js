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
const fetch_1 = require("./lib/fetch");
/**
 *
 * Collect and pre-process the form parameters
 *
 * @async
 */
const submit = async (event) => {
    const save_book = (data, name) => {
        console.log("saving");
        const dataURL = URL.createObjectURL(data);
        const download = document.getElementById('download');
        download.href = dataURL;
        download.download = name;
        download.click();
    };
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
            // console.log(JSON.stringify(a, null, 4));
            console.log(`NAMIVAN: ${process === undefined}, ${process.argv === undefined}`);
            console.log(JSON.stringify(process, null, 4));
            try {
                const data = await fetch_1.fetch_resource('http://localhost:8001/LocalData/icon.jpg');
                console.log(JSON.stringify(data, null, 4));
                // const response = await fetch('http://localhost:8001/LocalData/icon.jpg');
                // const data     = await response.blob();
                console.log('got here');
                save_book(data, 'namivan.jpg');
                console.log('got even here!');
            }
            catch (e) {
                console.log(`Something did not work with fetch: ${e}`);
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