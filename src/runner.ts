import { generate, Arguments } from './lib/process';
import yargs = require('yargs')


async function main() {
    const argv = yargs.options({
        r: { type: 'boolean', alias: 'respec',          description: 'The source is in respec', default: false },
        d: { type: 'string',  alias: 'publishDate',     description: 'Publication date', default: null},
        s: { type: 'string',  alias: 'specStatus',      description: 'Specification type', default: null},
        n: { type: 'string',  alias: 'shortName',       description: 'Short name', default: null},
        l: { type: 'string',  alias: 'addSectionLinks', description: 'Add section links with "§"', default: null},
        m: { type: 'number',  alias: 'maxTocLevel',     description: 'Max TOC level', default: null}
    })
    .version()
    .wrap(null)
    .argv;

    const args :Arguments = {
        url             : argv._.length === 0 ? 'http://localhost:8001/TR/vc-data-model/' : argv._[0],
        respec          : argv.r,
        publishDate     : argv.d,
        specStatus      : argv.s,
        shortName       : argv.n,
        addSectionLinks : argv.l,
        maxTocLevel     : argv.m
    }

    await generate(args);
    // await process('http://localhost:8001/LocalData/github/Publishing/pub-manifest/resp-conv.html');
}

main();
