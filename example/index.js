/**
 ** TOC:
 *  - setup .................... #L15
 *  - endpoints ................ #L25
 *    - without parameters ..... #L31
 *    - with parameters ........ #L69
 *    - with wildcard .......... #L85
 *  - middleware ............... #L98
 *    - general middleware ..... #L106
 *    - specific middleware .... #L114
 *  - types .................... #L126
 *  - utility functions ........ #L177
 */

/**
 ** ================ Setup ===================
 */

import { LOG } from '@peter-schweitzer/ez-utils';
import { App, buildRes, getBodyJSON, MIME, serveFromFS, throw404 } from '../index.js';

const app = new App();
app.listen(65535);

/**
 ** ================ Endpoints ===================
 */

// An Endpoint resolves the specified URI.

/* ================ without param =================== */

// Endpoints without parameters have the highest specificity, so they get matched first

// these are the most specific, as they only resolve a specific URI, requested via a specific method (also supports head, connect and trace)
app.get('/get', (_req, res, _params) => {
  buildRes(res, 'get');
});

app.put('/put', (_req, res, _params) => {
  buildRes(res, 'put');
});

app.post('/post', (_req, res, _params) => {
  buildRes(res, 'post');
});

app.delete('/delete', (_req, res, _params) => {
  buildRes(res, 'delete');
});

app.patch('/patch', (_req, res, _params) => {
  buildRes(res, 'patch');
});

app.options('/options', (_req, res, _params) => {
  buildRes(res, 'options');
});

// add() ignores the method, hence it's less specific than the examples above
app.add('/', (_req, res, _params) => {
  serveFromFS(res, './html/home.html');
});

app.add('/favicon.ico', (_req, res, _params) => {
  buildRes(res, null, { code: 404 });
});

/* ================ with parameters =================== */

//params are prefixed with ':' and can be registered with all above mentioned functions
// endpoints with parameters are less specific than endpoints without
// for more info on the Params class look at the types-section

// going to '/echo-route-params/first-param/second-param' will return 'first-param second-param'
app.add('/echo-route-params/:param1/:param2', (_req, res, params) => {
  buildRes(res, `${params.route('param1')} ${params.route('param2')}`);
});

// going to '/sum/351/69' will return '420'
app.add('/sum/:a/:b', (_req, res, params) => {
  buildRes(res, `${params.routeNumber('a', 0) + params.routeNumber('b', 0)}`);
});

/* ================ with wildcard =================== */

// by having '/:*' as the last part of the URI the endpoint will resolve all requests that start with the URI
// params will include the rest of the requested URI in route
// params.route('*') will return an array of strings (the rest split on every '/')

// going to '/wildcard/a/b/c' will return '3 (a-b-c)'
// going to '/wildcard' will return '0 ()'
app.add('/wildcard/:*', (_req, res, params) => {
  const rest = params.route('*');
  buildRes(res, `${rest.length} (${rest.join('-')})`);
});

/**
 ** ================ middleware ===================
 */

// Middleware gets called in order of adding them
// Middleware gets passed the underlying 'query' and 'route' LUT
// When the request gets resolved (i.e. by calling buildRes()) within middleware the rest of the middleware stack and the ResFunction (or 404 function) won't get called

/* ================ general middleware =================== */

// To use middleware that gets called on every request call app.use() with a Middleware
// Calling app.use() also returns app so you can chain .use() calls and/or register middleware directly after instantiating

// you can see the below debug output in the terminal on every request
app.use({ handle: async (req, res, query, route) => LOG(`handeling request for '${req.url}', with method '${req.method}'`) });

/* ================ specific middleware =================== */

// By calling use() on MiddlewareCurry you can add middleware to a specific ResFunction

// going to '/middleware/echo' will return "method: 'GET', url: '/middleware/echo', uri: '/middleware/echo'"
app
  .add('/middleware/echo', (req, res, params) => buildRes(res, 'this should not be seen'))
  .use({ handle: async (req, res, query, route) => buildRes(res, `method: '${req.method}', url: '${req.url}', uri: '${req.uri}', query: '${JSON.stringify(query)}'`) });

// going to '/middleware/error' will return 'middleware error'
app.add('/middleware/error', (req, res, params) => buildRes(res, 'this should not be seen')).use({ handle: async (req, res, query, params) => 'middleware error' });

/**
 ** ================ Types ===================
 */

/**
 ** MIME
 * MIME is an Object that provides nice auto completion for the most commonly used mime types.
 * Instead of writing them out every time you can just use STD_MIME and auto completion.
 * This aim is to:
 *  - decreases the amount of magic strings in your code
 *  - avoid errors tue to miss typing
 *  - spend less time repetitively typing the same few strings over and over
 */

/**
 ** Methods
 * functions that expect a HTTP method use this type
 * it is a list of all accepted strings i.e. {"GET"|"HEAD"|"POST"|"PUT"|"DELETE"|"CONNECT"|"OPTIONS"|"TRACE"|"PATCH"}
 */

/**
 ** ErrorOr<T>
 * the ErrorOr type is used to propagate errors in a predictable and consistent way
 * it has two properties: 'err' and 'data'
 * if an error occurs 'err' is a string and 'data' null, otherwise 'err' is null and data 'T' ('T' is a template and can be any type)
 */

/**
 ** Params
 * every resFunction gets passed a params object as the third argument
 * params include all query parameters, as well as route parameters when specified
 * route parameters are a component of the route and prefixed with ':' (e.g. '/:' signifies a route parameter)
 */

// going to '/echo-msg?msg=hello&msg2=world' will return 'hello world'
app.add('/echo-msg', (_req, res, params) => {
  buildRes(res, `${params.query('msg', '')} ${params.query('msg2', '')}`);
});

/**
 ** EZIncomingMessage
 * EZIncoming is like IncomingMessage from node:http but has the property 'uri', which is like 'url' but without the query parameters
 * The query parameters are in the params object
 */

/**
 ** MiddlewareCurry
 * When registering a ResFunction the underlying data structure gets curried into the .use() function.
 * Calling use() on a MiddlewareCurry returns the MiddlewareCurry object, so you can chain .use() calls to add multiple middlewares to the same ResFunction.
 */

/**
 ** ================ Utility Functions ===================
 */

/**
 ** getBodyJSON(req)
 *
 * getBodyJSON() takes a EZIncomingMessage and returns the JSON from the request body asynchronously (doesn't reject)
 *
 * req is passed by EZServer as the first argument to every resFunction
 * filePath is the path to the file that should be send to resolve the request
 * statusCode is the HTTP-status that should be send as part of the response (default 200 when omitted)
 */

app.get('/echo-json', async (req, res, _params) => {
  const { err, data } = await getBodyJSON(req);

  if (err !== null) {
    console.error(err);
    buildRes(res, "couldn't get JSON from request", { code: 500 });
  } else {
    buildRes(res, data, { mime: MIME.JSON });
  }
});

/**
 ** buildRes(res, data, { code, mime, headers })
 *
 * buildRes() takes a ServerResponse, an optional string or Buffer (default is null) and optionally an object
 *
 * res is passed by EZServer as the second argument to every resFunction
 * data can be a string or Buffer, that should be send to resolve the request
 * the last argument is an optional object containing the properties 'code', 'mime' and 'headers'
 *   code is the HTTP-status that gets send as part of the response (defaults to 200)
 *   mime is the mime-type that gets send as part of the response (defaults to "text/plain;charset=UTF-8")
 *   headers is an object representing key (string) value (string or number) pairs that represent additional headers of the response (defaults to empty Object)
 */

app.get('/hello', (_req, res, _params) => {
  buildRes(res, 'Hello, World', { code: 200, mime: MIME.TEXT, headers: {} });
});

/**
 ** serveFromFS(res, filePath, statusCode)
 *
 * serveFromFS takes a ServerResponse, a string and optionally a number (default is 200) and returns void
 *
 * res is passed by EZServer as the second argument to every resFunction
 * filePath is the path to the file that should be send to resolve the request
 * statusCode is the HTTP-status that should be send as part of the response (defaults to 200 when omitted)
 *
 * Note: serveFromFS uses buildRes() internally
 */

app.get('/example', (_req, res, _params) => {
  serveFromFS(res, './example/index.js');
});

/**
 ** throw404(req, res)
 *
 * throw404 takes an EZIncomingMessage and a ServerResponse and returns void
 *
 * req is passed by EZServer as the first argument to every resFunction
 * res is passed by EZServer as the second argument to every resFunction
 * throw404() sends a default 404 page to the requester with code 404 and mime 'text/html'
 *
 * Note: throw404() uses buildRes() internally
 */

app.add('/404', (req, res, _params) => {
  throw404(req, res);
});
