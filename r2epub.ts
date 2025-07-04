/**
 * ## CLI for the ReSpec to EPUB 3.4 conversion.
 *
 * This may be the conversion of a single HTML file (possibly pre-processed through ReSpec) or a collection of several HTML files. The usage of the entry point is:
 *
 * ```txt
 * Usage: r2epub [options] [url]
 *
 * Convert the file or collection configuration at [url] to EPUB 3.4
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
 * This function is a wrapper around the [convert](../lib/convert.ts/index.html) function.
 *
 * ### Usage examples:
 *
 * Convert the HTML file (as generated by ReSpec) to an EPUB 3.4 file. The generated publication's name is `short-name.epub`, where `short-name` is set in the ReSpec configuration:
 *
 * ``` sh
 * deno run -A r2epub.ts https://www.example.org/doc.html
 * ```
 * Convert the HTML _ReSpec source_ to an EPUB 3.4 file. The source is converted on-the-fly by respec:
 *
 * ``` sh
 * deno run -A r2epub.ts -r https://www.example.org/index.html
 * ```
 *
 * Convert the HTML _ReSpec source_ to an EPUB 3.4 file, setting its spec status to REC. The source is converted on-the-fly by respec, overwriting the `specStatus` entry in the configuration to `REC`:
 *
 * ``` sh
 * deno run -A r2epub.ts -r --specStatus REC https://www.example.org/index.html
 * ```
 *
 * Convert the documents listed in the JSON configuration file to generate a collection of several documents:
 *
 * ``` sh
 * deno run -A r2epub.ts https://www.example.org/collection.json
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
 * @module
 */


import * as r2epub  from './index.ts';
import * as fs      from 'node:fs';
import * as process from 'node:process';
import { Command }  from 'npm:commander@^14.0.0';
import { Buffer }   from "node:buffer";

/** @hidden */
const ERROR = 'ERROR';

/**
 * CLI to the ReSpec to EPUB 3.4 conversion.
 *
 * It is a simple interpretation of the command line, a wrapper around [[create_epub]], and the output of the generated content to local directory.
 *
 * This function is automatically started when this module is used from a command line.
 *
 * @async
 */
async function cli() {
    const program = new Command();
    program
        .version('2.0.0')
        .name('r2epub')
        .usage('[options] [url]')
        .description('Convert the file or collection configuration at [url] to EPUB 3.4')
        .option('-o, --output <fname>', 'output file name. If missing, the short name of the document is used')
        .option('-r, --respec', 'the source must be pre-processed by ReSpec', false)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .option('-s, --specStatus <type>', 'specification type', (value :string, _dummy :unknown) :string => {
            if (r2epub.spec_status_values.includes(value)) {
                return value;
            } else {
                console.error(`r2epub warning: invalid spec status value (${value}); ignored`);
                return ERROR
            }
        })
        .option('-d, --publishDate <date>', 'publication date')
        .option('-l, --addSectionLinks', 'add section links with "§".')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .option('-m, --maxTocLevel <number>', 'maximum TOC level', (value :string, _dummy :unknown) :string => {
            const n_value = Number(value);
            if (Number.isNaN(n_value) || n_value < 0) {
                console.error(`r2epub warning: invalid maximal TOC level (${value}); ignored`);
                return ERROR;
            } else {
                return value;
            }
        })
        .option('-p, --package', '[debug option] do not generate an EPUB file, just print the package file content.', false)
        .option('-t, --trace', '[debug option] print built in trace information while processing.', false)
        .argument('<url>', 'URL of the HTML file or collection configuration')
        .parse(process.argv);

    const cli_options = program.opts();

    if (program.args.length === 0) {
        console.error("r2epub error: no URL has been provided; exiting");
        process.exit(-1);
    } else {
        const url = program.args[0];
        const options :r2epub.Options = {
            // eslint-disable-next-line max-len
            respec : cli_options.respec || ((cli_options.specStatus || cli_options.publishDate || cli_options.addSectionLinks || cli_options.maxTocLevel) ? true : false),
            config : {
                publishDate     : cli_options.publishDate,
                specStatus      : cli_options.specStatus === ERROR ? undefined : cli_options.specStatus,
                addSectionLinks : cli_options.addSectionLinks ? true : false,
                maxTocLevel     : cli_options.maxTocLevel === ERROR ? undefined : cli_options.maxTocLevel,
            },
        }

        try {
            const the_ocf: r2epub.OCF = await r2epub.convert(url, options, cli_options.trace, cli_options.package)
            // In case of some debug settings no ocf is really generated...
            // The trick is that, if the ocf is not generated, 'the_ocf' is, in fact, an empty object.
            if (the_ocf.get_content) {
                const get_content = async (): Promise<Buffer> => {
                    const real_content = await the_ocf.get_content();
                    if (real_content instanceof Buffer) {
                        return real_content;
                    } else if (real_content instanceof ArrayBuffer) {
                        return Buffer.from(real_content);
                    } else {
                        throw new Error("r2epub error: the content is neither a Buffer nor an ArrayBuffer");
                    }
                }
                fs.writeFileSync(cli_options.output || the_ocf.name, await get_content());
            }
        } catch (e: any) {
            console.error(`r2epub error: ${e}, ${e.stack}`); // eslint-disable-line no-console
        }
    }
}

cli();
