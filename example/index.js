import { App, buildRes, serveFromFS } from '../index.js';

const app = new App();
app.listen('65535');

/**
 ** ================ EZServer Supports Endpoints ===================
 */

// An Endpoint only resolves the specified URI.
// Endpoints have the highest specificity, so 'over-write' Routs

// these are the most specific, as they only resolve a specific URI with a specific HTTP-methods
app.get('/get', (req, res) => {
  buildRes(res, 'get');
});
app.put('/put', (req, res) => {
  buildRes(res, 'put');
});
app.post('/post', (req, res) => {
  buildRes(res, 'post');
});
app.delete('/delete', (req, res) => {
  buildRes(res, 'delete');
});
app.patch('/patch', (req, res) => {
  buildRes(res, 'patch');
});
app.options('/options', (req, res) => {
  buildRes(res, 'options');
});
app.head('/head', (req, res) => {
  buildRes(res);
});

// add() ignores the HTTP-method, hence it's less specific
app.add('/', (req, res) => {
  serveFromFS(res, './html/home.html');
});

app.add('/favicon.ico', (req, res) => buildRes(res, '', { code: 404, mime: 'text/plain' }));

/**
 ** ================ EZServer Supports Routs ===================
 */

//These resolve all requests, with the specified HTTP-method, to routes beginning with the specified route ('/' - separated)
app.addRestRoute('get', '/rest/get', (req, res) => {
  buildRes(res, 'get-route');
});
app.addRestRoute('put', '/rest/put', (req, res) => {
  buildRes(res, 'put-route');
});
app.addRestRoute('post', '/rest/post', (req, res) => {
  buildRes(res, 'post-route');
});
app.addRestRoute('delete', '/rest/delete', (req, res) => {
  buildRes(res, 'delete-route');
});
app.addRestRoute('patch', '/rest/patch', (req, res) => {
  buildRes(res, 'patch-route');
});

//addRoute again ignores the HTTP-method (similar to add()), hence being less specific than addRestRoute()
app.addRoute('/route', (req, res) => {
  buildRes(res, `route`);
});

/**
 ** ================ EZServer also has Generic Functions ===================
 */

// This is an easy way to use the same function multiple times without spamming your own file with functions
app.addGenericRestFunction('get', 'name', (req, res) => {
  console.log('rest-name:', req.url);
  buildRes(res);
});
app.addGenericFunction('name', (req, res) => {
  console.log('name:', req.url);
  buildRes(res);
});

//supports endpoints
app.useGenericRestFunction('get', 'name', '/generic/endpoint');
app.useGenericFunction('name', '/generic/rest-endpoint');

//supports routs
app.useGenericRestFunction('get', 'name', '/generic/route', true);
app.useGenericFunction('name', '/generic/rest-route', true);
