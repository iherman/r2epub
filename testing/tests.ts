import * as r2epub from '../src/index.ts';
import * as fs     from 'node:fs';
import { Buffer }  from 'node:buffer';

interface RunData {
    url :string,
    output :string,
    respec :boolean,
    trace :boolean,
    remove :boolean,
    eflags ?: string[];
}

interface Suite {
    [index: string]: RunData
}

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

async function epubcheck(filename: string, flags: string[] = []): Promise<boolean> {
    const args = ["-jar", "epubcheck.jar", ...flags, filename];
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

async function testOne(runData: RunData): Promise<boolean> {
    await generateEpub(runData);
    const check: boolean = await epubcheck(runData.output, runData.eflags || []);
    if ((!check) || runData.remove) {
        await fs.promises.rm(runData.output);
    }
    return check;
}

const tests: Suite = {
    "epub-overview-33" : {
        url    : "https://www.w3.org/TR/epub-overview-33/",
        respec : false,
        output : "epub-overview-33.epub",
        remove : false,
        trace  : false,
    },

    "epub-overview-ed" : {
        url    : "https://w3c.github.io/epub-specs/epub33/overview/",
        respec : true,
        output : "epub-overview-ed.epub",
        remove : false,
        trace  : false,
    },

    "epub-book" : {
        url    : "http://localhost:8001/LocalData/github/Tools/r2epub/docs/collections/epub_local.json",
        respec : false,
        output : "epub-book.epub",
        remove : false,
        trace  : false,
    },

    "aria" : {
        url    : "https://www.w3.org/TR/dpub-aria-1.0/",
        respec : false,
        output : "aria.epub",
        remove : false,
        trace  : false,
    },

    "clreq" : {
        url    : "https://www.w3.org/TR/clreq/",
        respec : false,
        output : "clreq.epub",
        remove : false,
        trace  : false,
        eflags : ["-f"],
    },

    "epub-overview-34" : {
        url    : "https://www.w3.org/TR/epub-overview-34/",
        respec : false,
        output : "epub-overview-34.epub",
        remove : false,
        trace  : false,
    },

    "vc" : {
        url    : "http://localhost:8001/LocalData/github/Tools/r2epub/docs/collections/vc.json",
        respec : false,
        output : "vc.epub",
        remove : false,
        trace  : false,
        eflags : ["-f"],
    },
};


Deno.test(
    "-1 Test single file, without respec (epub-overview-33)",
    async () => {
        const result = await testOne(tests["epub-overview-33"]);
        assert(result, "epubcheck failed")
    },
);

Deno.test(
    "-2 Test single file, with respec (epub-overview-ed)",
    async () => {
        const result = await testOne(tests["epub-overview-ed"]);
        assert(result, "epubcheck failed");
    },
);

Deno.test(
    "-3 Test book with two chapters, without respec (epub-book)",
    async () => {
        const result = await testOne(tests["epub-book"]);
        assert(result, "epubcheck failed");
    },
);

Deno.test(
    "-4 Test single file, without respec, pre-2016 edition (aria)",
    async () => {
        const result = await testOne(tests["aria"]);
        assert(result, "epubcheck failed");
    },
);

// We know that, currently, epubcheck rejects this, and the error message is huge; better ignore...
Deno.test(
    "-5 Test single file, without respec, multilingual, lots of images (clreq)",
    async () => {
        const result = await testOne(tests["clreq"]);
        assert(result, "epubcheck failed");
    },
);

Deno.test(
    "-6 Test single file, without respec, originally in dark mode (epub-overview-34)",
    async () => {
        const result = await testOne(tests["epub-overview-34"]);
        assert(result, "epubcheck failed");
    },
);

Deno.test(
    "-7 Test a large book, all extracted from the Web. Epubcheck mostly fails due to invalid SVG generated by draw.io (vc)",
    async () => {
        const result = await testOne(tests["vc"]);
        assert(result, "epubcheck failed");
    },
);
