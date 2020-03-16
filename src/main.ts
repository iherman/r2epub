import { generate, Arguments } from './lib/process';
import yargs = require('yargs')


async function main() {
    const argv = yargs.options({
        r: { type: 'boolean', alias: 'respec',          default: false, description: 'The source is in respec'},
        p: { type: 'boolean', alias: 'package',         default: false, description: '[Debug] Do not generate an EPUB file, just print the package file content'},
        t: { type: 'boolean', alias: 'trace',             default: false, description: '[Debug] Print built in trace information'},
        d: { type: 'string',  alias: 'publishDate',     default: null,  description: 'Publication date'},
        s: { type: 'string',  alias: 'specStatus',      default: null,  description: 'Specification type'},
        l: { type: 'string',  alias: 'addSectionLinks', default: null,  description: 'Add section links with "§"'},
        m: { type: 'number',  alias: 'maxTocLevel',     default: null,  description: 'Max TOC level'}
    })
    .version()
    .wrap(null)
    .argv;

    const args :Arguments = {
        url             : argv._.length === 0 ? 'http://localhost:8001/TR/vc-data-model/' : argv._[0],
        respec          : argv.r,
        package         : argv.p,
        trace           : argv.t,
        config          : {
            publishDate     : argv.d,
            specStatus      : argv.s,
            addSectionLinks : argv.l,
            maxTocLevel     : argv.m
        }
     }

    try {
        await generate(args);
    } catch(e) {
        console.error(`EPUB Generation error: "${e}"`);
    }
}

main();
