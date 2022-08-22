const { createServer } = require('http');

const Resolvers = require('./Resolvers.js');
const Rest = require('./Rest.js');
const Endpoints = require('./Endpoints.js');

const { throw404 } = require('./utils.js');

class App {
  resolvers = new Resolvers();
  rest = new Rest();
  endpoints = new Endpoints();

  /** @param {string} port port the server is hosted on */
  constructor(port) {
    this.httpServer = createServer((req, res) => {
      req.url = decodeURIComponent(req.url);
      (this.resolvers.getResFunction(req) || this.rest.getResFunction(req) || this.endpoints.getResFunction(req) || throw404)(req, res);
    });

    this.httpServer.listen(port);
  }
}

module.exports = App;

