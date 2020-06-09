"use strict";
/**
 * ## Collection Configuration
 *
 * The JSON Collection Configuration file is defined as follows:
 *
 * ``` json
 * {
 *    "title"    : "Title of the collection",
 *    "name"     : "Used as the base file name of the final document",
 *    "comment"  : "Comment on the collection configuration",
 *    "chapters" : [{
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
 * For the meaning of the configuration options, see the [ReSpec manual](https://www.w3.org/respec/). The "title", "name", "chapters", and "url" fields are required, all others are optional. The value of "comment" is ignored by the module.
 *
 * The JSON collection configuration file is checked against the JSON [schema](https://github.com/iherman/src/clib/r2epub.schema.json) in the [[get_book_configuration]] function.
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const ajv_1 = __importDefault(require("ajv"));
const r2epub_schema_json_1 = __importDefault(require("./r2epub.schema.json"));
/**
 * Validates the input JSON configuration using the JSON schema, and converts the result to the internal data structure.
 *
 * @param data
 * @throws invalid schema, or schema validation error on the data
 */
function get_book_configuration(data) {
    const ajv = new ajv_1.default({
        "allErrors": true,
    });
    const validator = ajv.compile(r2epub_schema_json_1.default);
    const valid = validator(data);
    if (!valid) {
        throw `Schema validation error on the collection configuration file: \n${JSON.stringify(validator.errors, null, 4)}\nValidation schema: https://github.com/iherman/r2epub/src/clib/r2epub.schema.json`;
    }
    else {
        const chapters = data.chapters.map((chapter) => {
            const config = {};
            if (chapter.config !== undefined) {
                if (chapter.config.specStatus !== undefined)
                    config.specStatus = chapter.config.specStatus;
                if (chapter.config.publishDate !== undefined)
                    config.publishDate = chapter.config.publishDate;
                if (chapter.config.addSectionLinks !== undefined)
                    config.addSectionLinks = `${chapter.config.addSectionLinks}`;
                if (chapter.config.maxTocLevel !== undefined)
                    config.maxTocLevel = `${chapter.config.maxTocLevel}`;
            }
            return {
                url: chapter.url,
                respec: (chapter.respec === undefined) ? false : chapter.respec,
                config: config
            };
        });
        return {
            title: data.title,
            name: data.name,
            chapters: chapters
        };
    }
}
exports.get_book_configuration = get_book_configuration;
//# sourceMappingURL=args.js.map