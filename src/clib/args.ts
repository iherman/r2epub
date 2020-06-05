/**
 * ## Handling the input argument. See [[get_book_configuration]] for the details.
 *
 *
 * @packageDocumentation
 */

/**
 *
 */
import Ajv           from 'ajv';
import * as cConvert from './convert';

/**
 * JSON Schema (version 07) for the input argument, ie, the JSON Configuration file.
 */
const schema :string =
`{
    "$schema"    : "http://json-schema.org/draft-07/schema#",
    "$id"        : "https://github.com/iherman/rs2epub/r2epub.schema.json",
    "title"      : "Argument structure for rs2epub",
    "type"       : "object",
    "properties" : {
        "title" : {
            "type" : "string"
        },
        "name" : {
            "type" : "string"
        },
        "description" : {
            "type" : "string"
        },
        "chapters" : {
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
                                    "PR",
                                    "PER",
                                    "REC",
                                    "RSCND",
                                    "FPWD-NOTE",
                                    "WG-NOTE",
                                    "BG-DRAFT",
                                    "BG-FINAL",
                                    "CG-DRAFT",
                                    "CG-FINAL",
                                    "Member-SUBM",
                                    "draft-finding",
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
        "title", "name", "chapters"
    ]
}`

/**
 * Validate the input JSON configuration using the JSON [[schema]], and convert the result to the internal data structure.
 *
 * @param data
 * @throws schema validation error
 */
export function get_book_configuration(data :any) :cConvert.CollectionConfiguration {
    const ajv = new Ajv();
    const validator = ajv.compile(JSON.parse(schema));
    const valid = validator(data);
    if (!valid) {
        throw `Argument validity error: \n${JSON.stringify(validator.errors,null,4)}`
    } else {
        const chapters :cConvert.ChapterConfiguration[] = data.chapters.map((chapter :any) :cConvert.ChapterConfiguration => {
            const config :any = {};
            if (chapter.config !== undefined) {
                if (chapter.config.specStatus !== undefined)      config.specStatus      = chapter.config.specStatus;
                if (chapter.config.publishDate !== undefined)     config.publishDate     = chapter.config.publishDate;
                if (chapter.config.addSectionLinks !== undefined) config.addSectionLinks = `${chapter.config.addSectionLinks}`;
                if (chapter.config.maxTocLevel !== undefined)     config.maxTocLevel     = `${chapter.config.maxTocLevel}`;
            }

            return {
                url    : chapter.url,
                respec : (chapter.respec === undefined) ? false : chapter.respec,
                config : config
            }
        });

        return {
            title    : data.title,
            name     : data.name,
            chapters : chapters
        };
    }
}
