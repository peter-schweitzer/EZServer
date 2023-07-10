/**
 ** TOC:
 *  - setup
 *  - endpoints
 *  - routs
 *  - generic functions
 *  - types
 *  - utility functions
 */

/**
 ** ================ Setup ===================
 */

const { App, buildRes, serveFromFS, getBodyJSON, throw404 } = require('../');

const app = new App();
app.listen(65535);

/**
 ** ================ Endpoints ===================
 */

// An Endpoint resolves the specified URI exactly.
// Endpoints have the highest specificity, so have the highest priority

// these are the most specific, as they only resolve a specific URI, requested with a specific methods
app.get('/get', (req, res, params) => {
  buildRes(res, 'get');
});

app.put('/put', (req, res, params) => {
  buildRes(res, 'put');
});

app.post('/post', (req, res, params) => {
  buildRes(res, 'post');
});

app.delete('/delete', (req, res, params) => {
  buildRes(res, 'delete');
});
app.patch('/patch', (req, res, params) => {
  buildRes(res, 'patch');
});
app.options('/options', (req, res, params) => {
  buildRes(res, 'options');
});
app.head('/head', (req, res, params) => {
  buildRes(res);
});

// add() ignores the method, hence it's less specific than the examples above
app.add('/', (req, res, params) => {
  serveFromFS(res, './html/home.html');
});
app.add('/favicon.ico', (req, res, params) => {
  buildRes(res, '', { code: 404, mime: 'text/plain' });
});

/**
 ** ================ Routs ===================
 *! THESE WILL BE REMOVED IN EZServer 4.0.0
 */

//These resolve all requests, with the specified HTTP-method, to URI-routes beginning with the specified 'route' argument
app.addRestRoute('GET', '/rest/get', (req, res, params) => {
  buildRes(res, 'get-route');
});
app.addRestRoute('PUT', '/rest/put', (req, res, params) => {
  buildRes(res, 'put-route');
});
app.addRestRoute('POST', '/rest/post', (req, res, params) => {
  buildRes(res, 'post-route');
});
app.addRestRoute('DELETE', '/rest/delete', (req, res, params) => {
  buildRes(res, 'delete-route');
});
app.addRestRoute('PATCH', '/rest/patch', (req, res, params) => {
  buildRes(res, 'patch-route');
});

//addRoute ignores the HTTP-method (similar to add()), hence being less specific than addRestRoute()
app.addRoute('/route', (req, res, params) => {
  buildRes(res, `route`);
});

/**
 ** ================ Generic Functions ===================
 *! THESE WILL BE REMOVED IN EZServer 4.0.0
 */

// This is an easy way to use the same (generic) function multiple times
app.addGenericRestFunction('GET', 'name', (req, res, params) => {
  console.log('rest-name:', req.url);
  buildRes(res);
});
app.addGenericFunction('name', (req, res, params) => {
  console.log('name:', req.url);
  buildRes(res);
});

//use as endpoint
app.useGenericRestFunction('GET', 'name', '/generic/endpoint');
app.useGenericFunction('name', '/generic/rest-endpoint');

//use as rout
app.useGenericRestFunction('GET', 'name', '/generic/route', true);
app.useGenericFunction('name', '/generic/rest-route', true);

/**
 ** ================ Types ===================
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
 * params include all query parameters, as well as route parameters
 * route parameters are a component of the route and prefixed with ':' (e.g. '/:' signifies a route parameter)
 */

// going to '/echo-route-params/first-param/second-param' will return 'first-param second-param'
app.add('echo-route-prams/:param1/:param2', (req, res, params) => {
  buildRes(res, `${params.route('param1')} ${params.route('param2')}`);
});

// going to '/sum/351/69' will return '420'
app.add('sum/:a/:b', (req, res, params) => {
  buildRes(res, `${params.routeNumber('a', 0) + params.routeNumber('b', 0)}`);
});

// going to '/echo-msg?msg=hello&msg2=world' will return 'hello world'
app.add('echo-msg', (req, res, params) => {
  buildRes(res, `${params.query('msg', '')} ${params.query('msg2', '')}`);
});

/**
 ** EZIncomingMessage
 * EZIncoming is like IncomingMessage from node:http but has the property 'uri', which is like 'url' but without the query parameters
 * The query parameters are in the params object
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

app.get('/echo-json', async (req, res, params) => {
  const { err, data } = await getBodyJSON(req);

  if (err !== null) {
    console.error(err);
    buildRes(res, "couldn't get JSON from request", { code: 500 });
  } else {
    buildRes(res, data, { mime: 'application/json' });
  }
});

/**
 ** buildRes(res, data, { code, mime, headers })
 *
 * buildRes() takes a ServerResponse, an 'any' and optionally an object (default is {code: 200, mime: 'text/plain', headers: {}})
 *
 * res is passed by EZServer as the second argument to every resFunction
 * data can be anything that should be send to resolve the request (typically a string)
 * the last argument is an optional object containing the properties code, mime and headers (you can pass any number of them)
 *   code is the HTTP-status that gets send as part of the response
 *   mime is the mime-type that gets send as part of the response
 *   headers is an object representing key (string) value (string or number) pairs that represent additional headers of the response
 */
app.get('/hello', (req, res, params) => {
  buildRes(res, 'Hello, World');
});

/**
 ** serveFromFS(res, filePath, statusCode)
 *
 * serveFromFS takes a ServerResponse, a string and optionally a number (default is 200) and returns void
 *
 * res is passed by EZServer as the second argument to every resFunction
 * filePath is the path to the file that should be send to resolve the request
 * statusCode is the HTTP-status that should be send as part of the response (default 200 when omitted)
 *
 * Note: serveFromFS uses buildRes() internally
 */
app.get('/example', (req, res, params) => {
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
app.add('/404', (req, res, params) => {
  throw404(req, res);
});
