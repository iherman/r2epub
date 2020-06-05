"use strict";
/**
 * ## Main Entry point
 *
 * This is the core entry point for the module. See [[convert_to_epub]] for further details.
 *
 * @packageDocumentation
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ocf = __importStar(require("../lib/ocf"));
const fetch = __importStar(require("../lib/fetch"));
const chapter_1 = require("./chapter");
const nav = __importStar(require("./nav"));
const opf = __importStar(require("./opf"));
const cover = __importStar(require("./cover"));
const args = __importStar(require("./args"));
const _ = __importStar(require("underscore"));
/**
 * Creation of the real book data. The method runs [r2epub](https://iherman.github.io/r2epub/typedoc/index.html) on all chapters, creates the relevant [[Chapter]] instances, and retrieves some book level data to be used in subsequent steps.
 *
 * @async
 * @param book_data - user supplied configuration data
 * @returns the [[Book]] structure with all [[Chapter]] entries properly initialized.
 */
const generate_book_data = async (book_data) => {
    // Just to make things more readable, I take the steps separately instead of putting directly into the return value...
    // 1. An array of chapters is created from the argument data
    // 2. Each chapter is initialized. Initialization is async, ie, each of these steps create a Promise.
    //    Note that the first chapter is signalled so that the common files (logo, css for cover page, etc) are also transferred to the final book, but only once.
    const promises = book_data.chapters.map((chapter_data, index) => (new chapter_1.Chapter(chapter_data, index === 0)).initialize());
    // 3. Sync at this point by waiting for all Promises to resolve, yielding the list of chapters.
    const chapters = await Promise.all(promises);
    // 4. Collect all the editors, it will be used later...
    const editors = _.flatten(chapters.map((chapter) => chapter.editors));
    // 5. Collect the date, it will be used later...
    //    The maximal value of all constituent dates is used
    const dates = chapters.map((chapter) => chapter.date);
    const date = dates.reduce((accumulator, currentValue) => accumulator > currentValue ? accumulator : currentValue);
    // Yep, we got the book skeleton
    return {
        title: book_data.title,
        name: book_data.name,
        editors: _.unique(editors),
        date: date,
        ocf: new ocf.OCF(`${book_data.name}.epub`),
        chapters: chapters
    };
};
/**
 * Creation of an [OCF instance](https://iherman.github.io/r2epub/typedoc/modules/_lib_ocf_.html) for the final book.
 *
 * The main processing steps are:
 *
 * 1. Convert the user JSON configuration to the internal data structure (see [[get_book_configuration]]) and collect the data for the output target (see [[generate_book_data]]);
 * 2. Create (and store in the target’s OCF) the package file (see [[create_opf]]);
 * 3. Create (and store in the target’s OCF) the cover page (see [[create_cover_page]]);
 * 4. Create (and store in the target’s OCF) the navigation file for the whole book (see [[create_nav_page]]);
 * 5. Collect, from each [[Chapter]] the real content from the chapter’s OCF and copy it to the target’s OCF (with modified file path values).
 *
 * @async
 * @param config_url - the user supplied data, i.e., the result of JSON parsing of the input argument
 * @param trace whether tracing is set (for debugging)
 * @param print_package whether the package stops at the creation of an EPUB content and displays the content of the OPF file itself (for debugging)
 * @returns a Promise holding the final [OCF](https://iherman.github.io/r2epub/typedoc/classes/_lib_ocf_.ocf.html) content.
 */
async function create_epub(config_url, trace = false, print_package = false) {
    const data = await fetch.fetch_json(config_url);
    // check, via a JSON schema, the validity of the input and create the right arguments
    const book_data = args.get_book_configuration(data);
    // generate the skeleton of the book
    const the_book = await generate_book_data(book_data);
    // Create the OPF file, the cover and nav pages, and store each of them in the book at
    // well specified places
    const the_opf = opf.create_opf(the_book);
    if (print_package) {
        console.log(the_opf);
        return {};
    }
    else {
        the_book.ocf.append(the_opf, 'package.opf');
        the_book.ocf.append(cover.create_cover_page(the_book), 'cover.xhtml');
        the_book.ocf.append(nav.create_nav_page(the_book), 'nav.xhtml');
        // Store the data in the final zip file
        the_book.chapters.forEach((chapter) => {
            chapter.store_manifest_items(the_book);
        });
        return the_book.ocf;
    }
}
exports.create_epub = create_epub;
//# sourceMappingURL=convert.js.map