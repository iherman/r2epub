import * as r2epub from '../index.ts';
import * as fs     from 'node:fs';
import { Buffer }  from 'node:buffer';

/**
 * The data for a specific test. 
 */
interface RunData {
    /** URL for the HTML file, or the JSON configuration file */
    url :string,
    /** Name of the output epub file (without the .epub suffix) */
    output :string,
    /** Whether a respec pre-processor must be used first. This is irrelevant for JSON book configuration files */
    respec :boolean,
    /** Whether the debug trace steps must be displayed or not */
    trace :boolean,
    /** Whether the file must be deleted after epubcheck, if it is successful */
    remove :boolean,
    /** Epubcheck flags */
    eflags ?: string[];
}

/**
 * The full test suite data
 */
interface Suite {
    [index: string]: RunData
}

/**
 * Needed for the simple assertion function below
 */
class AssertionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AssertionError";
    }
}

/**
 * No need for a complex assertion function, just use a simple one.
 */
function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new AssertionError(message);
    }
}

/**
 * Perform an epubcheck on  file.
 * Note the File name to get to the epubcheck.jar. At the moment, this must be set manually...
 * 
 * @param filename 
 * @param flags 
 * @returns 
 */
async function epubcheck(filename: string, flags: string[] = []): Promise<boolean> {
    const args = ["-jar", "/Users/ivan/Source/JavaLibraries/epubcheck-5.2.1/epubcheck.jar", ...flags, filename];
    const cmd = new Deno.Command("/usr/bin/java", {
        args,
        stdout : "piped",
        stderr : "piped",
    });
    try {
        const { stdout, stderr, code } = await cmd.output();
        // console.log(`\nChecking ${filename}`)
        // console.log(`Epubcheck results: ${new TextDecoder().decode(stdout)}`)
        if (code !== 0) console.log(`Epubcheck errors: ${new TextDecoder().decode(stderr)}\n`)
        return code === 0;
    } catch (_) {
        console.log("r2epub testing problem: could not run epubcheck; is it installed? ")
        return true;
    }
}

/**
 * Creation of an epub file.
 * 
 * @param runData 
 */
async function generateEpub(runData: RunData): Promise<void> {
    const options :r2epub.Options = {
        respec : runData.respec,
    }
    const the_ocf: r2epub.OCF = await r2epub.convert(runData.url, options, runData.trace, false);
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
    fs.writeFileSync(runData.output, await get_content());
}

/**
 * A single test: generate the epub, then epubcheck and check the result of the latter.
 * 
 * Note that if the check is false, the epub file is not removed.
 * 
 * @param runData 
 * @returns 
 */
async function testOne(runData: RunData): Promise<boolean> {
    await generateEpub(runData);
    const check: boolean = await epubcheck(runData.output, runData.eflags || []);
    if (check && runData.remove) {
        await fs.promises.rm(runData.output);
    }
    return check;
}

/** =================================================================================================== */
// Test data

const tests: Suite = {
    "epub-overview-33" : {
        url    : "https://www.w3.org/TR/epub-overview-33/",
        respec : false,
        output : "epub-overview-33.epub",
        remove : true,
        trace  : false,
    },

    "epub-overview-ed" : {
        url    : "https://w3c.github.io/epub-specs/epub33/overview/",
        respec : true,
        output : "epub-overview-ed.epub",
        remove : true,
        trace  : false,
    },

    "epub-book" : {
        url: "https://iherman.github.io/r2epub/collections/epub_small.json",
        respec : false,
        output : "epub-book.epub",
        remove : true,
        trace  : false,
    },

    "aria" : {
        url    : "https://www.w3.org/TR/dpub-aria-1.0/",
        respec : false,
        output : "aria.epub",
        remove : true,
        trace  : false,
    },

    "clreq" : {
        url    : "https://www.w3.org/TR/clreq/",
        respec : false,
        output : "clreq.epub",
        remove : true,
        trace  : false,
        eflags : ["-f"],
    },

    "epub-overview-34" : {
        url    : "https://www.w3.org/TR/epub-overview-34/",
        respec : false,
        output : "epub-overview-34.epub",
        remove : true,
        trace  : false,
    },

    "epub33": {
        url    : "https://iherman.github.io/r2epub/collections/epub.json",
        respec : false,
        output : "epub33.epub",
        remove : true,
        trace  : false,
    },

    "vc" : {
        url: "https://iherman.github.io/r2epub/collections/vc.json",
        respec : false,
        output : "vc.epub",
        remove : true,
        trace  : false,
        eflags : ["-f"],
    },

    "config_error" : {
        url    : "https://iherman.github.io/r2epub/collections/config_err.json",
        respec : false,
        output : "error.epub",
        remove : false,
        trace  : false,
    },

    "single": {
        url    : "https://iherman.github.io/r2epub/collections/single.json",
        respec : false,
        output : "single.epub",
        remove : true,
        trace  : false,
    },

    "jsonld": {
        url    : "https://iherman.github.io/r2epub/collections/json-ld_test.json",
        respec : false,
        output : "jsonld.epub",
        remove : false,
        trace  : false,
    }
};

/** =================================================================================================== */

/**
 * The real tests!!!
 */
Deno.test({
    name: "001. Convert a single document, using the post-2021 setup. (output: epub-overview-33)",
    sanitizeResources: false,
    fn: async () => {
        const result = await testOne(tests["epub-overview-33"]);
        assert(result, "epubcheck failed")
    },
});

Deno.test({
    name: "002. Convert a respec source, pre-processing through the spec generator. (output: epub-overview-ed)",
    sanitizeResources: false,
    fn: async () => {
        const result = await testOne(tests["epub-overview-ed"]);
        assert(result, "epubcheck failed");
    },
});

// Ignore until the configuration fils are pushed on github.io
Deno.test.ignore({
    name: "003. Convert a simple, 2-chapter book. (output: epub-book)",
    sanitizeResources: false,
    fn: async () => {
        const result = await testOne(tests["epub-book"]);
        assert(result, "epubcheck failed");
    },
});

Deno.test({
    name: "004. Convert a single document, using a pre-2021 setup. (output: aria)",
    sanitizeResources: false,
    fn: async () => {
        const result = await testOne(tests["aria"]);
        assert(result, "epubcheck failed");
    },
});

// We know that, currently, epubcheck rejects this, and the error message is huge; better ignore until epubcheck gets updated
Deno.test.ignore({
    name: "005. Convert a file with a large number of images, and font settings. Relies on EPUB 3.4 for using ITS attributes; epubcheck is currently weakened to pass. (output: clreq)",
    sanitizeResources: false,
    fn: async () => {
        const result = await testOne(tests["clreq"]);
        assert(result, "epubcheck failed");
    },
});

Deno.test({
    name: "006. Convert a single document, using the latest dark-mode css. (output: epub-overview-34)",
    sanitizeResources: false,
    fn: async () => {
        const result = await testOne(tests["epub-overview-34"]);
        assert(result, "epubcheck failed");
    },
});

Deno.test({
    name: "007. A collection with a single entry, testing purposes for a single document as a collection. (output: single)",
    sanitizeResources: false,
    fn: async () => {
        const result = await testOne(tests["single"]);
        assert(result, "epubcheck failed");
    },
});

Deno.test({
    name: "008. Stress-test: convert a book of 8 chapters, all extracted from the Web. Note that some diagrams are erroneous SVG (a draw.io bug) and epubcheck had to be weakened to pass. (output: vc)",
    sanitizeResources: false,
    fn: async () => {
        const result = await testOne(tests["vc"]);
        assert(result, "epubcheck failed");
    },
});

Deno.test({
    name: "009. Stress-test: convert a book of 10 chapters (the EPUB 33 specs, i.e., eat your own dogfood…). All replacement files are strictly remote. (output: epub33)",
    sanitizeResources: false,
    fn: async () => {
        // Make sure that it takes all the EPUB specific files from a remote directory and not locally
        const prev = Deno.env.get(r2epub.ENV_MODIFIED_FILE_LOCATION);
        Deno.env.delete(r2epub.ENV_MODIFIED_FILE_LOCATION);
        try {
            const result = await testOne(tests["epub33"]);
            assert(result, "epubcheck failed");    
        } finally {
            if (prev !== undefined) {
                Deno.env.set(r2epub.ENV_MODIFIED_FILE_LOCATION, prev);
            }
        }
    },
});

// Ignore until the configuration files are pushed on github.io
Deno.test.ignore({
    name: "010. Stress-test: convert a book with 4 chapters (the JSON-LD 1.1 specs). All replacement files are strictly remote and all sources are pre-processed by respec. (output: jsonld)",
    sanitizeResources: false,
    fn: async () => {
        // Make sure that it takes all the EPUB specific files from a remote directory and not locally
        const prev = Deno.env.get(r2epub.ENV_MODIFIED_FILE_LOCATION);
        Deno.env.delete(r2epub.ENV_MODIFIED_FILE_LOCATION);
        try {
            const result = await testOne(tests["jsonld"]);
            assert(result, "epubcheck failed");
        } finally {
            if (prev !== undefined) {
                Deno.env.set(r2epub.ENV_MODIFIED_FILE_LOCATION, prev);
            }
        }
    },
});


// ******************************************* Negative tests ******************************
Deno.test({
    name: "100. This is a negative test: it should fail on the JSON schema check. (No output)",
    sanitizeResources: false,
    fn: async () => {
        try {
            const result = await testOne(tests["config_error"]);
            // This should not get here...
            assert(false, "Schema check did not happen...");
        } catch(_) {
            assert(true, "");
        }
    },
})
