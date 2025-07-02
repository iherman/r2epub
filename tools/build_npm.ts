import { build, emptyDir } from "jsr:@deno/dnt";
import { parse }           from "jsr:@std/jsonc";

const deno_json = parse(Deno.readTextFileSync("deno.jsonc"));

await emptyDir("./.npm");

await build({
    entryPoints: [
        "index.ts", 
        {
            kind : "bin",
            name : "serve",
            path : "./serve.ts"
        },
        {
            kind: "bin",
            name: "r2epub",
            path: "./r2epub.ts"
        },
    ],
    // jsdom and xmlserializer npm packages do not seem to have a proper typescript data
    // definition file, and the typechecker complains for those two.
    // At this moment there is no real replacement for the tools in deno land
    // (The real missing bit is xmlserializer working with the dom, which does not seem to exist in
    // deno-dom.)
    // So typechecking is switched off. Oh well...
    typeCheck: false,
    // The test suite depends on the availability of epubcheck. Can't be really re-used easily...    
    test: false,
    outDir: "./.npm",
    shims: {
        // see JS docs for overview and more options
        deno: true,
    },
    importMap: "deno.jsonc",
    package: {
        // package.json properties
        name: "r2epub",
        version: deno_json.version,
        date: deno_json.date,
        description: deno_json.description,
        license: deno_json.license,
        repository : {
            type : deno_json.repository.type,
            url  : deno_json.repository.url,
        },
        bugs: {
            url: deno_json.bugs.url,
        },
        author: deno_json.author,
    },
});

// steps to run after building
Deno.copyFileSync("LICENSE.md", ".npm/LICENSE.md");
Deno.copyFileSync("README.md", ".npm/README.md");

