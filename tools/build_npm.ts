import { build, emptyDir } from "jsr:@deno/dnt";

const deno_json = JSON.parse(Deno.readTextFileSync("deno.json"));

await emptyDir("./.npm");

await build({
    entryPoints: [
        "./index.ts",
        // {
        //      kind: "bin",
        //      name: "r2epub",
        //      path: "./r2epub.ts",
        // },
        // {
        //     kind: "bin",
        //     name: "serve",
        //     path: "./serve.ts",
        // },
   ],
    typeCheck: false,
    test: false,
    outDir: "./.npm",
    shims: {
        // see JS docs for overview and more options
        deno: true,
    },
    importMap: "deno.json",
    package: {
        // package.json properties
        name: "r2epub",
        version: "2.0.0",
        date: deno_json.date,
        description: deno_json.description,
        license: deno_json.license,
        repository: {
            type: "git",
            url: "git+https://github.com/iherman/r2epub.git",
        },
        bugs: {
            url: "https://github.com/iherman/r2epub/issues",
        },
    },
    postBuild() {
        // steps to run after building and before running the tests
        Deno.copyFileSync("LICENSE.md", ".npm/LICENSE.md");
        Deno.copyFileSync("README.md", ".npm/README.md");
    },
});
