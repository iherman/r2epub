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

import * as ocf        from './lib/ocf';
import * as conversion from './lib/conversion';
import { fetch_html, fetch_resource, fetch_type } from './lib/fetch';


/**
 *
 * Collect and pre-process the form parameters
 *
 * @async
 */
const submit = async (event :Event) :Promise<any> => {
    const save_book = (data: any, name :string) => {
        console.log("saving")
        const dataURL = URL.createObjectURL(data);
        const download = document.getElementById('download') as HTMLAnchorElement;
        download.href = dataURL;
        download.download = name;
        download.click();
    };

    event.preventDefault();

    try {
        // const the_form :HTMLFormElement = document.getElementById('main_form') as HTMLFormElement;
        const url :HTMLInputElement = document.getElementById('url') as HTMLInputElement;
        const respec :HTMLInputElement = document.getElementById('respec') as HTMLInputElement;
        const publishDate :HTMLInputElement = document.getElementById('publishDate') as HTMLInputElement;
        const specStatus :HTMLInputElement = document.getElementById('specStatus') as HTMLInputElement;
        const addSectionLinks :HTMLInputElement = document.getElementById('addSectionLinks') as HTMLInputElement;
        const maxTocLevel :HTMLInputElement = document.getElementById('maxTocLevel') as HTMLInputElement;


        if (!(url.value === null || url.value === '')) {
            const a :conversion.Arguments  = {
                url    : url.value,
                respec : respec.value === 'true',
                config : {
                    publishDate     : publishDate.value === '' ? undefined : publishDate.value,
                    specStatus      : specStatus.value === 'null' ? undefined : specStatus.value,
                    addSectionLinks : addSectionLinks.value === 'null' ? undefined : addSectionLinks.value,
                    maxTocLevel     : maxTocLevel.value === '' ? undefined : maxTocLevel.value,
                }
            }
            // Testing...!
            // console.log(JSON.stringify(a, null, 4));
            console.log(`NAMIVAN: ${process === undefined}, ${process.argv === undefined}`);
            console.log(JSON.stringify(process, null, 4));


            try {
                const data = await fetch_resource('http://localhost:8001/LocalData/icon.jpg');

                console.log(JSON.stringify(data, null, 4));

                // const response = await fetch('http://localhost:8001/LocalData/icon.jpg');
                // const data     = await response.blob();


                console.log('got here')
                save_book(data, 'namivan.jpg');
                console.log('got even here!')
            } catch(e) {
                console.log(`Something did not work with fetch: ${e}`);
            }
            return;
        }
    } catch(e) {
        console.log(e)
        alert(`Exception raised... ${e}`);
    }
}

window.addEventListener('load', () => {
    const submit_button = document.getElementById('submit');
    submit_button.addEventListener('click', submit);
});
