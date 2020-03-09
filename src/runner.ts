import { process } from './lib/process';

async function main() {
    await process('http://localhost:8001/TR/vc-data-model/');
    // await process('http://localhost:8001/LocalData/github/Publishing/pub-manifest/resp-conv.html');
}

main();
