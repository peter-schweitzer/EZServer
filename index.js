const { createServer, IncomingMessage, ServerResponse } = require('http');

const LOG = console.log;
const WARN = console.warn;

class App {
  constructor() {
    this.m_httpServer = createServer((req, res) => {
      req.url = decodeURIComponent(req.url);
      (this.m_restEndpoint(req) || this.m_endpoints[url] || this.m_restRoute(req) || this.m_route(req) || throw404)(req, res);
    });
  }

  /** @param {number|string} port port the server is hosted on */
  listen(port) {
    this.m_httpServer.listen(port);
  }
}

module.exports = { App, buildRes, getType, serveFromFS, getBodyJSON };

