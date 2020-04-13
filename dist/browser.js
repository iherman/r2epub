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
/**
 *
 * Collect and pre-process the form parameters
 *
 */
const submit = () => {
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
        alert(JSON.stringify(a, null, 4));
    }
};
window.addEventListener('load', () => {
    const submit_button = document.getElementById('submit');
    submit_button.addEventListener('click', submit);
});
//# sourceMappingURL=browser.js.map