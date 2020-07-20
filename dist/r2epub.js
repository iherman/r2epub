#! /usr/local/bin/node
"use strict";
/**
 * ## CLI to the ReSpec to EPUB 3.2 conversion. This may be the conversion of a single HTML file (possibly pre-processed through ReSpec) or a collection of several HTML files.
 *
 * The usage of the entry point is:
 *
 * ```
 * Usage: r2epub [options] [url]
 *
 * Convert the file or collection configuration at [url] to EPUB 3.2
 *
 * Options:
 * -V, --version               output the version number
 * -o, --output <fname>        output file name. If missing, the short name of the document is used
 * -r, --respec                the source must be pre-processed by ReSpec (default: false)
 * -s, --specStatus <type>     specification type
 * -d, --publishDate <date>    publication date
 * -l, --addSectionLinks       add section links with "§".
 * -m, --maxTocLevel <number>  maximum TOC level
 * -p, --package               [debug option] do not generate an EPUB file, just print the package file content. (default: false)
 * -t, --trace                 [debug option] print built in trace information while processing. (default: false)
 * -h, --help                  display help for command
 * ```
 *
 * For the `-d`, `-s`, `-l`, or `-m` flags, see the [ReSpec manual](https://www.w3.org/respec/). If any of those flags is set, `-r` is implied (i.e., it is not necessary to set it explicitly).
 *
 * This function is a wrapper around [[convert]].
 *
 * ### Usage examples:
 *
 * Convert the HTML file (as generated by ReSpec) to an EPUB 3.2 file. The generated publication's name is `short-name.epub`, where `short-name` is set in the ReSpec configuration:
 *
 * ``` sh
 * node r2epub.js https://www.example.org/doc.html`
 * ```
 * Convert the HTML _ReSpec source_ to an EPUB 3.2 file. The source is converted on-the-fly by respec:
 *
 * ``` sh
 * node r2epub.js -r https://www.example.org/index.html`
 * ```
 *
 * Convert the HTML _ReSpec source_ to an EPUB 3.2 file, setting its spec status to REC. The source is converted on-the-fly by respec, overwriting the `specStatus` entry in the configuration to `REC`:
 *
 * ``` sh
 * node r2epub.js -r --specStatus REC https://www.example.org/index.html`
 * ```
 *
 * Convert the documents listed in the JSON configuration file to generate a collection of several documents:
 *
 * ``` sh
 * node r2epub.js https://www.example.org/collection.json`
 * ```
 *
 * where the collection may be something like:
 *
 * ```json
 * {
 *   "title": "Specification for Underwater Basket Weaving",
 *   "name": "weaving",
 *   "chapters": [
 *        {
 *           "url": "https://www.example.org/first.html"
 *        },
 *       {
 *           "url": "https://www.example.org/second.html",
 *           "respec": false,
 *           "config": {}
 *       },
 *       {
 *           "url": "https://www.example.org/third.html",
 *           "respec": true,
 *           "config": {
 *               "maxTocLevel" : 3
 *           }
 *       }
 *   ]
 * }
 * ```
 *
 * See also some [example collection configurations files](https://iherman.github.io/r2epub/collections/).
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
*
*
*/
/* Main imports */
const r2epub = __importStar(require("./index"));
const _ = __importStar(require("underscore"));
const constants = __importStar(require("./lib/constants"));
const fs = __importStar(require("fs"));
/** @hidden */
const { program } = require('commander');
/** @hidden */
const ERROR = 'ERROR';
/**
 * CLI to the ReSpec to EPUB 3.2 conversion.
 *
 * It is a simple interpretation of the command line, a wrapper around [[create_epub]], and the output of the generated content to local directory.
 *
 * @async
 */
async function cli() {
    program
        .version('1.2.0')
        .name('r2epub')
        .usage('[options] [url]')
        .description('Convert the file or collection configuration at [url] to EPUB 3.2')
        .option('-o, --output <fname>', 'output file name. If missing, the short name of the document is used')
        .option('-r, --respec', 'the source must be pre-processed by ReSpec', false)
        .option('-s, --specStatus <type>', 'specification type', (value, dummy) => {
        if (constants.spec_status_values.includes(value)) {
            return value;
        }
        else {
            console.error(`r2epub warning: invalid spec status value (${value}); ignored`);
            return ERROR;
        }
    })
        .option('-d, --publishDate <date>', 'publication date')
        .option('-l, --addSectionLinks', 'add section links with "§".')
        .option('-m, --maxTocLevel <number>', 'maximum TOC level', (value, dummy) => {
        const n_value = Number(value);
        if (_.isNaN(n_value) || n_value < 0) {
            console.error(`r2epub warning: invalid maximal TOC level (${value}); ignored`);
            return ERROR;
        }
        else {
            return value;
        }
    })
        .option('-p, --package', '[debug option] do not generate an EPUB file, just print the package file content.', false)
        .option('-t, --trace', '[debug option] print built in trace information while processing.', false)
        .parse(process.argv);
    if (program.args.length === 0) {
        console.error("r2epub error: no URL has been provided; exiting");
        process.exit(-1);
    }
    else {
        const url = program.args[0];
        const options = {
            respec: program.respec || ((program.specStatus || program.publishDate || program.addSectionLinks || program.maxTocLevel) ? true : false),
            config: {
                publishDate: program.publishDate,
                specStatus: program.specStatus === ERROR ? undefined : program.specStatus,
                addSectionLinks: program.addSectionLinks ? "true" : undefined,
                maxTocLevel: program.maxTocLevel === ERROR ? undefined : program.maxTocLevel,
            }
        };
        // console.log(`URL: ${url}`);
        // console.log(`Options: ${JSON.stringify(options, null, 4)}`);
        // console.log(`Tracing: ${program.trace}, Package Only: ${program.package}`);
        // console.log(`Output: ${program.output}`);
        try {
            const the_ocf = await r2epub.convert(url, options, program.trace, program.package);
            // In case of some debug settings no ocf is really generated...
            if (the_ocf.get_content) {
                const content = await the_ocf.get_content();
                fs.writeFileSync(program.output || the_ocf.name, content);
            }
        }
        catch (e) {
            console.error(`r2epub error: ${e}`);
        }
    }
}
cli();
//# sourceMappingURL=r2epub.js.map