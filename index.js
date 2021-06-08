const { App } = require('./EZServer');

const app = new App('8080');

app.addResolver('/', (req, res) => {
  fetchFS('./html/home.html', res);
});

app.addEndpoint('/img/', (req, res) => {
  fetchFS(`.${req.url}.png`, res);
});

app.createGroup('myGroup', (req, res) => {
  console.log('myGroup:');
  console.log(req.url);
});

app.addEndpointToGroup('/endpoint1/', 'myGroup');
app.addEndpointToGroup('/endpoint2/', 'myGroup');
app.addEndpointToGroup('/endpoint3/', 'myGroup');
app.addEndpointToGroup('/endpoint4/', 'myGroup');
