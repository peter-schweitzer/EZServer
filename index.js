const { App, serveFromFS } = require('./EZServer');

const app = new App('8080');

app.addResolver('/', (req, res) => {
  serveFromFS('./html/home.html', res);
});

app.addEndpoint('/img/', (req, res) => {
  serveFromFS(`.${req.url}.png`, res);
});

app.createGroup('myGroup', (req, res) => {
  console.log('myGroup:');
  console.log(req.url);
});

app.addEndpointToGroup('/endpoint1/', 'myGroup');
app.addEndpointToGroup('/endpoint2/', 'myGroup');
app.addEndpointToGroup('/endpoint3/', 'myGroup');
app.addEndpointToGroup('/endpoint4/', 'myGroup');

app.REST.get('/api/get', (req, res) => {
  console.log('REST.get -> req.body:', !!req.body || false);
});
app.REST.post('/api/post', (req, res) => {
  console.log('REST.post -> req.body:', !!req.body || false);
});
app.REST.put('/api/put', (req, res) => {
  console.log('REST.put -> req.body:', !!req.body || false);
});
app.REST.delete('/api/delete', (req, res) => {
  console.log('REST.delete -> req.body:', !!req.body || false);
});
app.REST.patch('/api/patch', (req, res) => {
  console.log('REST.patch -> req.body:', !!req.body || false);
});

