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
const fetch = __importStar(require("./lib/fetch"));
/**
 *
 * Collect and pre-process the form parameters
 *
 * @async
 */
const submit = async () => {
    const save_book = (data, name) => {
        const dataURL = URL.createObjectURL(data);
        const download = document.getElementById('download');
        download.href = dataURL;
        download.download = name;
        download.click();
    };
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
        alert(JSON.stringify(a, null, 4));
        // Testing the fetch and save mechanism
        const data = await fetch.fetch_resource('http://localhost:8001/LocalData/icon.jpg');
        save_book(data, 'namivan.jpg');
        return;
    }
};
window.addEventListener('load', () => {
    const submit_button = document.getElementById('submit');
    submit_button.addEventListener('click', submit);
});
//# sourceMappingURL=browser.js.map