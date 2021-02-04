let { App } = require('./EZServer');

let app = new App('8080');

app.addResolver('/404', (req, res) => {
  console.log(req.url);
  app.fetchFS('./html/404.html', res);
});
