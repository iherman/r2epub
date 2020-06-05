/**
 * ## Interface to the server conversion
 *
 * Bridge between the HTML form and the conversion server. It relies on `<input>` elements with the `id` values set to
 * `url`, `respec`, `publishDate`, `specStatus`, `addSectionLinks`, and `maxTocLevel`.
 *
 * The script relies on the service running at 'https://r2epub.herokuapp.com/'
 *
 * This script must be converted to Javascript.
 *
 *
 * @packageDocumentation
*/

/**
 * Default conversion service URL. Unless the user has set the `data-r2epubservice` attribute on the form element to a different URL, this service is used.
 *
 */
const default_service :string = 'https://r2epub.herokuapp.com/';

interface ReturnedData {
    file_name :string,
    content   :Blob
}

/**
 * Get the service to perform the conversion.
 *
 * @async
 * @param resource_url The _full_ URL of the service performing the conversion (including the right query parameters)
 * @returns the final content as well as the local name of the EPUB instance
 */
async function fetch_book(resource_url :string) :Promise<ReturnedData> {
    let fname :string;
    return new Promise((resolve, reject) => {
        try {
            window.fetch(resource_url)
                .then((response) => {
                    if (response.ok) {
                        fname = response.headers.get('Content-Disposition').split(';')[1].split('=')[1]
                        return response.blob()
                    } else {
                        reject(new Error(`HTTP response ${response.status}: ${response.statusText} on ${resource_url}`));
                    }
                })
                .then((content => {
                    resolve({
                        file_name : fname,
                        content   : content
                    });
                }))
                .catch((err) => {
                    reject(new Error(`Problem accessing ${resource_url}: ${err}`));
                });
        } catch (err) {
            reject(err);
        }
    });
}


/**
 *
 * Generate the EPUB file via a service.
 *
 * The method is set as an even handler for a submit button. The `event` argument is only used to prevent the default behavior of the button (i.e., to avoid reloading the page).
 *
 * By default, the service to be used is `https://r2epub.herokuapp.com/`, unless `data-r2epubservice` attribute is set to a different URL on the form element.
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
        const form :HTMLElement                 = document.getElementById('main_form');
        const url :HTMLInputElement             = document.getElementById('url') as HTMLInputElement;
        const respec :HTMLInputElement          = document.getElementById('respec') as HTMLInputElement;
        const publishDate :HTMLInputElement     = document.getElementById('publishDate') as HTMLInputElement;
        const specStatus :HTMLInputElement      = document.getElementById('specStatus') as HTMLInputElement;
        const addSectionLinks :HTMLInputElement = document.getElementById('addSectionLinks') as HTMLInputElement;
        const maxTocLevel :HTMLInputElement     = document.getElementById('maxTocLevel') as HTMLInputElement;

        const service =  form.dataset.r2epubservice || default_service;

        if (!(url.value === null || url.value === '')) {
            const query :string[] = [
                `url=${url.value}`,
                `respec=${respec.value === 'true'}`
            ];

            if (publishDate.value !== '') {
                query.push(`publishDate=${publishDate.value}`);
            }
            if (specStatus.value !== "null") {
                query.push(`specStatus=${specStatus.value}`);
            }
            if (addSectionLinks.value !== "null") {
                query.push(`addSectionLinks=${addSectionLinks.value}`);
            }
            if (maxTocLevel.value !== '') {
                query.push(`maxTocLevel=${maxTocLevel.value}`);
            }
            const service_url = `${service}?${query.join('&')}`;
            try {
                // turn on the progress bar at the bottom of the form
                progress.style.setProperty('visibility', 'visible');

                // const content = await (await window.fetch(service_url)).blob();
                const returned :ReturnedData = await fetch_book(service_url);

                save_book(returned.content, returned.file_name);

                // Remove the query string from the URL bar
                document.location.search = '';

                // Clean up the user interface and we are done!
                progress.style.setProperty('visibility', 'hidden');
                fading_success();
            } catch(e) {
                progress.style.setProperty('visibility', 'hidden');
                alert(`EPUB Generation Error: ${e}`);
            }
        } else {
            alert(`No or empty URL value`);
        }
    } catch(e) {
        alert(`Form interpretation Error... ${e}`);
    }
}

window.addEventListener('load', () => {
    const submit_button = document.getElementById('submit');
    submit_button.addEventListener('click', submit);
});
