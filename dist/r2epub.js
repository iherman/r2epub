#! /usr/local/bin/node
"use strict";
/**
 * ## CLI for the ReSpec to EPUB 3.3 conversion.
 *
 * This may be the conversion of a single HTML file (possibly pre-processed through ReSpec) or a collection of several HTML files. The usage of the entry point is:
 *
 * ```txt
 * Usage: r2epub [options] [url]
 *
 * Convert the file or collection configuration at [url] to EPUB 3.2
 *
 * Options:
 *
 * -V, --version               output the version number
 * -o, --output <fname>        output file name.
 *                             If missing, the short name of the document is used
 * -r, --respec                the source must be pre-processed by ReSpec
 *                             (default: false)
 * -s, --specStatus <type>     specification type
 * -d, --publishDate <date>    publication date
 * -l, --addSectionLinks       add section links with "§".
 * -m, --maxTocLevel <number>  maximum TOC level
 * -p, --package               [debug option] do not generate an EPUB file,
 *                             just print the package file content.
 *                             (default: false)
 * -t, --trace                 [debug option] print built in trace information while
 *                             processing. (default: false)
 * -h, --help                  display help for command
 * ```
 *
 * For the `-d`, `-s`, `-l`, or `-m` flags, see the [ReSpec manual](https://www.w3.org/respec/). If any of those flags is set, `-r` is implied (i.e., it is not necessary to set it explicitly).
 *
 * This function is a wrapper around the [[convert]] function.
 *
 * ### Usage examples:
 *
 * Convert the HTML file (as generated by ReSpec) to an EPUB 3.2 file. The generated publication's name is `short-name.epub`, where `short-name` is set in the ReSpec configuration:
 *
 * ``` sh
 * node r2epub.js https://www.example.org/doc.html
 * ```
 * Convert the HTML _ReSpec source_ to an EPUB 3.2 file. The source is converted on-the-fly by respec:
 *
 * ``` sh
 * node r2epub.js -r https://www.example.org/index.html
 * ```
 *
 * Convert the HTML _ReSpec source_ to an EPUB 3.2 file, setting its spec status to REC. The source is converted on-the-fly by respec, overwriting the `specStatus` entry in the configuration to `REC`:
 *
 * ``` sh
 * node r2epub.js -r --specStatus REC https://www.example.org/index.html
 * ```
 *
 * Convert the documents listed in the JSON configuration file to generate a collection of several documents:
 *
 * ``` sh
 * node r2epub.js https://www.example.org/collection.json
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 */
/* Main imports */
const r2epub = require("./index");
const _ = require("underscore");
const common = require("./lib/common");
const fs = require("fs");
/** @hidden */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { program } = require('commander');
/** @hidden */
const ERROR = 'ERROR';
/**
 * CLI to the ReSpec to EPUB 3.2 conversion.
 *
 * It is a simple interpretation of the command line, a wrapper around [[create_epub]], and the output of the generated content to local directory.
 *
 * This function is automatically started when this module is used from a command line.
 *
 * @async
 */
async function cli() {
    program
        .version('1.2.7')
        .name('r2epub')
        .usage('[options] [url]')
        .description('Convert the file or collection configuration at [url] to EPUB 3.2')
        .option('-o, --output <fname>', 'output file name. If missing, the short name of the document is used')
        .option('-r, --respec', 'the source must be pre-processed by ReSpec', false)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .option('-s, --specStatus <type>', 'specification type', (value, dummy) => {
        if (common.spec_status_values.includes(value)) {
            return value;
        }
        else {
            console.error(`r2epub warning: invalid spec status value (${value}); ignored`);
            return ERROR;
        }
    })
        .option('-d, --publishDate <date>', 'publication date')
        .option('-l, --addSectionLinks', 'add section links with "§".')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            // eslint-disable-next-line max-len
            respec: program.respec || ((program.specStatus || program.publishDate || program.addSectionLinks || program.maxTocLevel) ? true : false),
            config: {
                publishDate: program.publishDate,
                specStatus: program.specStatus === ERROR ? undefined : program.specStatus,
                addSectionLinks: program.addSectionLinks ? "true" : undefined,
                maxTocLevel: program.maxTocLevel === ERROR ? undefined : program.maxTocLevel,
            },
        };
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