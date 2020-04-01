#! /usr/local/bin/node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const conversion = __importStar(require("./lib/conversion"));
const fs = __importStar(require("fs"));
/** @hidden */
const yargs = require("yargs");
/**
 * CLI to the ReSpec to EPUB 3.2 conversion.
 *
 * It is a simple interpretation of the command line, a wrapper around [[create_epub]], and the output of the generated content to local directory.
 *
 * @async
 */
async function cli() {
    const argv = yargs.options({
        o: { type: 'string', alias: 'output', default: null, description: 'Output file name. If missing, the short name of the document is used.' },
        r: { type: 'boolean', alias: 'respec', default: false, description: 'The source is in respec.' },
        p: { type: 'boolean', alias: 'package', default: false, description: '[Debug] Do not generate an EPUB file, just print the package file content.' },
        t: { type: 'boolean', alias: 'trace', default: false, description: '[Debug] Print built in trace information.' },
        d: { type: 'string', alias: 'publishDate', default: null, description: 'Publication date.' },
        s: { type: 'string', alias: 'specStatus', default: null, description: 'Specification type.' },
        l: { type: 'string', alias: 'addSectionLinks', default: null, description: 'Add section links with "§".' },
        m: { type: 'number', alias: 'maxTocLevel', default: null, description: 'Max TOC level.' },
    })
        .version()
        .wrap(null)
        .argv;
    const args = {
        url: argv._.length === 0 ? 'http://localhost:8001/TR/vc-data-model/' : argv._[0],
        respec: argv.r,
        config: {
            publishDate: argv.d,
            specStatus: argv.s,
            addSectionLinks: argv.l,
            maxTocLevel: argv.m
        }
    };
    try {
        const conversion_process = new conversion.RespecToEPUB(argv.t, argv.p);
        const the_ocf = await conversion_process.create_epub(args);
        const content = await the_ocf.get_content();
        fs.writeFileSync(argv.o || the_ocf.name, content);
    }
    catch (e) {
        console.error(`EPUB Generation error: "${e}"`);
    }
}
cli();
//# sourceMappingURL=cli.js.map