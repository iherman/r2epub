import { process } from './lib/process';

async function main() {
    await process('http://localhost:8001/TR/vc-data-model/');
}

main();
