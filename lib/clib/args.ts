// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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
 * The JSON collection configuration file is checked against the JSON schema (see below in the code) in the [[get_book_configuration]] function.
 *
 * See also some [example collection configurations files](https://iherman.github.io/r2epub/collections/).
 *
 * @packageDocumentation
 * @module
 */

/**
 *
 */
import type * as cConvert               from './convert.ts';
import { parser, type ValidationError } from '@exodus/schemasafe';

/**
 * Validates the input JSON configuration using the JSON schema, and converts the result to the internal data structure.
 *
 * @param data
 * @throws invalid schema, or schema validation error on the data
 */
export function get_book_configuration(data :any) :cConvert.CollectionConfiguration {
    const schema = JSON.parse(argument_schema);
    const parse = parser(schema, {
        mode                    : "default",
        includeErrors           : true,
        allErrors               : true,
        requireStringValidation : false,
    });
    // Validation happens on a string, no the runtime object, so we have to stringify the data back first...
    // Oh well, this is how it is done in the library...
    const result = parse(JSON.stringify(data));

    if (result.valid !== true) {
        if (result.errors === undefined || result.errors.length === 0) {
            throw 'Schema validation error on the collection configuration file: file invalid, but no errors found';
        } else {
            const errors :string[] = result.errors?.map((e: ValidationError): string => {
                return `\n - error at ${e.instanceLocation}: ${e.keywordLocation};`;
            });
            throw `Schema validation error on the collection configuration file: ${errors.join()}`;
        }
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


/**
 * The schema itself...
 */
const argument_schema = `{
    "$schema"    : "http://json-schema.org/draft-07/schema#",
    "$id"        : "https://github.com/iherman/r2epub/src/clib/r2epub.schema.json",
    "title"      : "Argument structure for rs2epub",
    "type"       : "object",
    "properties" : {
        "name" : {
            "type" : "string"
        },
        "id" : {
            "type" : "string"
        },
        "comment" : {
            "type" : "string"
        },
        "readingOrder" : {
            "type"  : "array",
            "items" : {
                "type" : "object",
                "properties": {
                    "url" : {
                        "type" : "string",
                        "format": "uri"
                    },
                    "respec" : {
                        "type" : "boolean"
                    },
                    "config" : {
                        "type" : "object",
                        "properties" : {
                            "specStatus" : {
                                "type" : "string",
                                "enum" : [
                                    "base",
                                    "MO",
                                    "unofficial",
                                    "ED",
                                    "FPWD",
                                    "WD",
                                    "LC",
                                    "LD",
                                    "LS",
                                    "CR",
                                    "CRD",
                                    "PR",
                                    "PER",
                                    "REC",
                                    "RSCND",
                                    "STMT",
                                    "DISC",
                                    "DNOTE",
                                    "FPWD-NOTE",
                                    "WG-NOTE",
                                    "BG-DRAFT",
                                    "BG-FINAL",
                                    "CG-DRAFT",
                                    "CG-FINAL",
                                    "Member-SUBM",
                                    "draft-finding",
                                    "editor-draft-finding",
                                    "finding"
                                ]
                            },
                            "publishDate" : {
                                "type" : "string",
                                "format" : "date"
                            },
                            "addSectionLinks" : {
                                "type" : "boolean"
                            },
                            "maxTocLevel" : {
                                "type" : "integer",
                                "minimum": 0
                            }
                        },
                        "additionalProperties": false
                    }
                },
                "additionalProperties": false,
                "required": ["url"]
            },
            "uniqueItems": true,
            "minItems": 1
        }
    },
    "additionalProperties": false,
    "required": [
        "name", "id", "readingOrder"
    ]
}`;
