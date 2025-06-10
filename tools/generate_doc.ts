/* *************************************************************************
Simple tools to put a copy of the README.md file into the module documentation
part of index.ts. By running `deno doc` on the resulting file the generated
documentation will also generate content based on the README.md file
(which is, otherwise, ignored by `deno doc`).

Furthermore, the script adds a `.nojekyll` to the generated directory, to make
the documentation served properly via a GitHub page.

I hope that, at some point, this tools will become unnecessary, and `deno doc`
will be comparable to, say, typedoc...
**************************************************************************** */

// Some data are picked from deno.json...
const deno_json = JSON.parse(Deno.readTextFileSync("deno.json"));

/* These entry may have to be adapted to the local requirements */
const README: string       = "README.md";
const INDEX_ANCHOR: string = " * @module"; // The anchor line in index.ts where a copy of the README.md should go
const EXTRAS: string[]     = ["lib/*"];    // Extra directories to be added to the generated documentation.
const OUTPUT_DIR: string   = "docs";       // Directory for the documentation


/* The various variables that are used below; these may have to be adapted to local setups */
const params = {
    /* Name of the readme file that should be included in the spec. It is supposed to be a markdown file */
    readme : README,

    /* The entry point to the package, ie, the module that is exported */
    index : deno_json.exports,

    /*
        The index file is supposed to begin with a jsdoc string; the anchor is the text where the
        readme content will be inserted (before that line)
     */
    indexAnchor: INDEX_ANCHOR,

    /* Name of the package; this is what appears at the top of the documentation */
    name: deno_json.name,

    /* List of directories to be added to the documentation. */
    extras: EXTRAS,

    /* Target directory for the documentation */
    output_dir: OUTPUT_DIR,
}

/* *************************************************************************

Copy the content of the Readme file into the index.ts file

**************************************************************************** */
function copy_readme() {
    const readme: string[] = Deno.readTextFileSync(params.readme).split('\n');
    const index: string[] = Deno.readTextFileSync(params.index).split('\n');

    const result: string[] = [];
    for (const indexLine of index) {
        // Locate the anchor for the readme file:
        if (indexLine.startsWith(params.indexAnchor)) {
            // copy the content of the readme file, preceded with the documentation mark
            for (const readmeLine of readme) {
                result.push(` * ${readmeLine}`);
            }
        }
        result.push(indexLine);
    }

    Deno.writeTextFileSync(params.index, result.join('\n'));
}

/* *************************************************************************

Execute the deno doc command as a spawned subprocess

**************************************************************************** */
function doc() {
    let args: string[] = [
        'doc',
        '--html',
        `--name="${params.name}"`,
        `--output=${params.output_dir}`,
        params.index,
    ];

    if (params.extras.length > 0) {
        args = [...args,  ...params.extras];
    }

    // Define the command to run 'deno doc'
    const command = new Deno.Command(Deno.execPath(),  { args });

    // Execute the command and collect output
    const { code, stdout, stderr } = command.outputSync();

    // Check if the command was successful
    if (code !== 0) {
        console.error(new TextDecoder().decode(stderr)); // Print any errors
    } else {
        console.log(new TextDecoder().decode(stdout));
    }
}

/* *************************************************************************

The controlling steps...

**************************************************************************** */

/* The index file must be copied into a temporary file to restore it later */
const tempFile = Deno.makeTempFileSync({suffix: ".ts"});
Deno.copyFileSync(params.index, tempFile);

/* Include the readme file content into the index file */
copy_readme();

/* Execute deno doc */
doc();

/* Restore the original index file from the temporary storage */
Deno.copyFileSync(tempFile, params.index);
Deno.removeSync(tempFile);

/* Add a .nojekyll file into the directory to make the result usable as a GitHub page */
Deno.writeTextFileSync("./docs/.nojekyll", "");
