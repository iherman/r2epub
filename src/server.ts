import http            from 'http';
import * as urlHandler from 'url';
import * as _          from 'underscore';
import * as constants  from './lib/constants';
import * as process    from './lib/process';

import { fetch_html, fetch_resource, fetch_type, URL } from './lib/fetch';


interface Content {
    content :any;
    header  :object;
}

interface Query {
    [index :string] :string|string[]
}


async function get_epub(query :Query) : Promise<Content> {
    if (query.url === undefined) {
        throw "No URL has been specified"
    } else {
        const call_arguments :process.Arguments = {
            url    : query.url as string,
            respec : query.respec === undefined ? false : query.respec === 'true' || query.respec === 'True',
            config : _.omit(query, 'respec', 'url'),
        }

        // Take it from here!!!!!!

        const content  = await fetch_resource('https://www.w3.org/People/Ivan/TR_EPUB/CR.svg');
        return {
            content : content,
            header  : {
                'Content-type'        : constants.media_types.svg,
                'Content-Length'      : Buffer.byteLength(content),
                'Expires'             : (new Date()).toString(),
                'Content-Disposition' : 'attachment; filename=CR.svg'
            }
        }
    }
}



http.createServer( async (request :http.IncomingMessage, response :http.ServerResponse) => {
    try {
        const query :Query = urlHandler.parse(request.url, true).query;
        const the_book :Content = await get_epub(query);

        response.writeHead(200, _.extend(
            the_book.header,
            constants.CORS_headers
        ));
        response.write(the_book.content);
        response.end();
    } catch(e) {
        response.writeHead(400, {
            'Content-type' : 'text/plain'
        });
        response.write("Error during EPUB generation!\n\n")
        response.write(e.toString())
        response.end();
    }
}).listen('9000');

