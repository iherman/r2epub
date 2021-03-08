/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ## Collection Configuration
 *
 * The JSON Collection Configuration file is defined as follows:
 *
 * ``` json
 * {
 *    "name"         : "Title of the collection",
 *    "id"           : "Used as the base file name of the final document",
 *    "comment"      : "Comment on the collection configuration",
 *    "readingOrder" : [{
 *        "url"    : "URL of the first chapter"
 *        "respec" : "whether the document must be pre-processed by ReSpec [boolean]",
 *        "config" : {
 *            "publishDate     : "[iso date format]",
 *            "specStatus      : "...",
 *            "addSectionLinks : "[boolean]",
 *            "maxTocLevel     : "[number]"
 *        }
 *    },{
 *        ...
 *    }]
 * }
 * ```
 *
 * For the meaning of the configuration options, see the [ReSpec manual](https://www.w3.org/respec/). The "name", "id", "readingOrder", and "url" fields are required, all others are optional. The value of "comment" is ignored by the module.
 *
 * The JSON collection configuration file is checked against the JSON [schema](https://github.com/iherman/src/clib/r2epub.schema.json) in the [[get_book_configuration]] function.
 *
 * See also some [example collection configurations files](https://iherman.github.io/r2epub/collections/).
 *
 * @packageDocumentation
 */

/**
 *
 */
import * as cConvert from './convert';
import * as myAjv    from './js/myAjv';

/**
 * Validates the input JSON configuration using the JSON schema, and converts the result to the internal data structure.
 *
 * @param data
 * @throws invalid schema, or schema validation error on the data
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function get_book_configuration(data :any) :cConvert.CollectionConfiguration {
    // const ajv = new Ajv({
    //     "allErrors" : true,
    // });
    // const validator = ajv.compile(conf_schema);
    // const valid     = validator(data);
    const my_ajv = new myAjv.MyAjv();
    const valid = my_ajv.validate(data);

    if (!valid) {
        throw `Schema validation error on the collection configuration file: \n${JSON.stringify(my_ajv.errors,null,4)}\nValidation schema: https://github.com/iherman/r2epub/src/clib/r2epub.schema.json`
    } else {
        const chapters :cConvert.ChapterConfiguration[] = data.readingOrder.map((chapter :any) :cConvert.ChapterConfiguration => {
            const config :any = {};
            if (chapter.config !== undefined) {
                if (chapter.config.specStatus !== undefined) config.specStatus = chapter.config.specStatus;
                if (chapter.config.publishDate !== undefined) config.publishDate = chapter.config.publishDate;
                if (chapter.config.addSectionLinks !== undefined) config.addSectionLinks = `${chapter.config.addSectionLinks}`;
                if (chapter.config.maxTocLevel !== undefined) config.maxTocLevel = `${chapter.config.maxTocLevel}`;
            }

            return {
                url    : chapter.url,
                respec : (chapter.respec === undefined) ? false : chapter.respec,
                config : config,
            }
        });

        return {
            name         : data.name,
            id           : data.id,
            readingOrder : chapters,
        };
    }
}
