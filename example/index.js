const { App, serveFromFS } = require('../index');

const app = new App('8080');

/**
 ** ================ EZServer Supports Resolvers ===================
 */

// - A Resolver resolves a single route.
// - Resolvers have the highest specificity, so they can over-write Endpoints

app.resolvers.add('/', (req, res) => {
  serveFromFS(res, './html/home.html');
});

/**
 ** ================ EZServer Supports 'regular' Endopoints ===================
 */

// - The only difference to regular Endpoints is that they are filtered by method.

//This resolves all routes matching the specified route || uses the most specific endpoint
app.endpoints.add('/img/', (req, res) => {
  serveFromFS(res, `.${req.url}`);
});

/**
 * This creates a group, identified by it's name, containing a [resolv-function]{@link resFunction}.
 * The groups resFunction can be changed on the fly.
 * To do so you can call 'createGroup(groupName, fn)' with the same 'groupName' and a new resFunction 'fn'.
 */
app.endpoints.createGroup('myGroup', (req, res) => {
  console.log('myGroup:', req.url);
});

/**
 * you can add as many routs as you want.
 * they will execute the [resolve-Function]{@link resFunction} of the specified group
 */
app.endpoints.addToGroup('/endpoint1/', 'myGroup');
app.endpoints.addToGroup('/endpoint2/', 'myGroup');

/**
 ** ================== EZServer Supports REST Endopoints ======================
 */

// - The only difference to regular Endpoints is that they are filtered by method.

//method: 'GET'
app.rest.get('/api/get', (req, res) => {
  console.log('rest.get -> req.body:', !!req.body || false);
});
//method: 'PSOT'
app.rest.post('/api/post', (req, res) => {
  console.log('rest.post -> req.body:', !!req.body || false);
});
//method: 'PUT'
app.rest.put('/api/put', (req, res) => {
  console.log('rest.put -> req.body:', !!req.body || false);
});
//method: 'DELETE'
app.rest.delete('/api/delete', (req, res) => {
  console.log('rest.delete -> req.body:', !!req.body || false);
});
//method: 'PATCH'
app.rest.patch('/api/patch', (req, res) => {
  console.log('rest.patch -> req.body:', !!req.body || false);
});

/** @typedef {import('../src/endpoints/index').resFunction} resFunction */

