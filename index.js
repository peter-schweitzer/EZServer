const { createServer, IncomingMessage, ServerResponse } = require('http');

const LOG = console.log;
const WARN = console.warn;

class App {
  /** @type {resolvers} */
  m_endpoints = {};

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

  /**
   * @param {string} route path of requested URL
   * @param {resFunction} fn function to resolve the request
   * @returns {void}
   */
  add(route, fn) {
    this.m_endpoints[route] = fn;
    LOG('added:', route);
  }
}

module.exports = { App, buildRes, getType, serveFromFS, getBodyJSON };

