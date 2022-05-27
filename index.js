const { App, serveFromFS } = require('./EZServer');

const app = new App('8080');

app.addResolver('/', (req, res) => {
  serveFromFS('./html/home.html', res);
});

app.endpoints.add('/img/', (req, res) => {
  serveFromFS(`.${req.url}.png`, res);
});

app.endpoints.createGroup('myGroup', (req, res) => {
  console.log('myGroup:');
  console.log(req.url);
});

app.endpoints.addToGroup('/endpoint1/', 'myGroup');
app.endpoints.addToGroup('/endpoint2/', 'myGroup');
app.endpoints.addToGroup('/endpoint3/', 'myGroup');
app.endpoints.addToGroup('/endpoint4/', 'myGroup');

app.rest.get('/api/get', (req, res) => {
  console.log('rest.get -> req.body:', !!req.body || false);
});
app.rest.post('/api/post', (req, res) => {
  console.log('rest.post -> req.body:', !!req.body || false);
});
app.rest.put('/api/put', (req, res) => {
  console.log('rest.put -> req.body:', !!req.body || false);
});
app.rest.delete('/api/delete', (req, res) => {
  console.log('rest.delete -> req.body:', !!req.body || false);
});
app.rest.patch('/api/patch', (req, res) => {
  console.log('rest.patch -> req.body:', !!req.body || false);
});

let _get = (req, res) => {
  console.log('rest.multi get -> req.body:', !!req.body || false);
};
let _post = (req, res) => {
  console.log('rest.multi post -> req.body:', !!req.body || false);
};
let _put = (req, res) => {
  console.log('rest.multi put -> req.body:', !!req.body || false);
};
let _delete = (req, res) => {
  console.log('rest.multi delete -> req.body:', !!req.body || false);
};
let _patch = (req, res) => {
  console.log('rest.multi patch -> req.body:', !!req.body || false);
};

app.rest.addMulti('/api/multi', { PUT: _put, POST: _post, PATHCH: _patch, GET: _get, DELETE: _delete });

