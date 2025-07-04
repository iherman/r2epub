/* eslint-disable max-lines-per-function */
/**
 * ## Generate the `Overview.xhtml` entry
 *
 * Generation involves two different steps:
 *
 * 1. The package entry for `Overview.xhtml` may contain a `properties` attribute; see [manifest item properties](https://www.w3.org/TR/epub/#app-item-properties-vocab) for further details.
 * 2. Due to the rigidity of the iBook reader, the DOM tree has to change: all children of the `<body>` should be encapsulated into a top level block
 * element (we use `<div role="main">`). This is because iBook imposes a zero padding on the body element, and that cannot be controlled by the user;
 * the introduction of the top level block element allows for suitable CSS adjustments in the [common css file](https://www.w3.org/People/Ivan/r2epub/base.css).
 *
 *
 * @packageDocumentation
 * @module
*/

import * as urlHandler              from 'node:url';
import type { ResourceRef, Global } from './convert.ts';
import { to_xhtml }                 from './utils.ts';
import * as common                  from './common.ts';

/**
 * Generate the resource entry for the `Overview.xhtml` item into the package; that includes setting the various manifest item
 * properties (see [manifest item properties](https://www.w3.org/TR/epub/#app-item-properties-vocab)).
 *
 * The following properties are set, if applicable:
 *
 * - [mathml](https://www.w3.org/TR/epub/#sec-mathml): there is an explicit usage of mathml.
 * - [scripted](https://www.w3.org/TR/epub/#sec-scripted): there are active scripts.
 * - [svg](https://www.w3.org/TR/epub/#sec-svg-prop): there is explicit svg usage.
 * - [remote-resources](https://www.w3.org/TR/epub/#sec-remote-resources): there are remote resources, typically video, audio, or images.
 *
 * The function also modifies the DOM tree by introducing a `<main>` element right as a child of `body`, and adding the fixed `toc-inline` class to ensure that the
 * body occupies the whole width of the viewport.
 *
 * @param global
 * @return - a single element array with the resource definition of the `Overview.xhtml` entry
 */
export function generate_overview_item(global: Global): ResourceRef[] {
    // This won't happen, but TS is otherwise unhappy.
    if (!(global.html_element && global.dom)) return [];

    //------------ Setting the properties for the relevant OPF entry
    const properties: string[] = [];

    // 1. Mathml usage
    if (global.html_element.querySelector('math') !== null) {
        properties.push('mathml');
        global.opf_content?.add_a11y_feature(['MathML']);
    }

    {
        // 2a. are there active scripts. Care should be taken that a <script> element may be a data block, that does not count.
        const scripts: HTMLScriptElement[] = Array.from(global.html_element.querySelectorAll('script')) as HTMLScriptElement[]
        const is_there_script = scripts.find((element: HTMLScriptElement): boolean => {
            if (element.hasAttribute('type')) {
                const type = element.getAttribute('type');
                if (type) {
                    return ['application/javascript', 'application/ecmascript', common.media_types.js, common.media_types.es].includes(type);
                } else {
                    return false;
                }
            } else {
                return true;
            }
        })
        if (is_there_script) {
            properties.push('scripted');
        } else {
            // 2b. check if there is a form element, that also sets a 'scripted' tag
            if (global.html_element?.querySelector('form') !== null) {
                properties.push('scripted');
            }
        }
    }

    // 3. svg usage
    if (global.html_element?.querySelector('svg') !== null) {
        properties.push('svg');
    } else {
        // look for possible svg image or picture references
        const sources = Array.from(global.html_element.querySelectorAll('img, source, object, iframe')) as HTMLElement[];
        const is_there_svg_usage = sources.find((element: HTMLElement): boolean => {
            if (element.hasAttribute('src')) {
                return (element.getAttribute('src') || '').endsWith('.svg')
            } else if (element.hasAttribute('type')) {
                return element.getAttribute('type') === 'image/svg+xml';
            } else {
                return false;
            }
        });
        if (is_there_svg_usage) {
            properties.push('svg');
        }
    }

    // 4. external resources
    {
        const sources: HTMLElement[] = Array.from(global.html_element.querySelectorAll('video, audio, img, source, iframe')) as HTMLElement[];
        const are_there_external_resources = sources.find((element: HTMLElement): boolean => {
            if (element.hasAttribute('src')) {
                const parsed = urlHandler.parse(element.getAttribute('src') || '');
                return parsed.protocol !== null && (parsed.host !== null && parsed.host !== 'www.w3.org');
            } else {
                return false;
            }
        })
        if (are_there_external_resources) {
            properties.push('remote-resources');
        }
    }

    // 5. See if there are images and trust respec and the a11y review that those will be assigned with long descriptions
    // and captions... based on that, adding accessibility feature metadata
    {
        const images: HTMLElement[] = ((global.html_element) ?Array.from(global.html_element.querySelectorAll('img')) : []) as HTMLElement[];
        if (images.length > 0) {
            global.opf_content?.add_a11y_feature(['captions','longDescription']);
        }
    }

    //------------------ Modify the DOM
    // A new 'main' element must be created
    // All children of the 'body' element must be "re-parented" to the "main"
    const main_element = global.dom.window.document.createElement('div');
    main_element.setAttribute('role', 'main');
    const body = global.html_element.querySelector('body');
    if (body) {
        // Trick from MDN...
        while (body.firstChild) {
            main_element.append(body.firstChild.cloneNode(true));
            // The list is LIVE, so it will re-index each call
            body.removeChild(body.firstChild);
        }
        body.append(main_element);

        // Add a fixed class to the body element to ensure that the full display is used
        body.classList.add('toc-inline');

        return [{
            media_type   : common.media_types.xhtml,
            id           : 'main',
            relative_url : 'Overview.xhtml',
            text_content : to_xhtml(global.dom),
            properties   : properties.join(' '),
        }]
    } else {
        return [];
    }
}

