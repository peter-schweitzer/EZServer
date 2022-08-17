const { createServer } = require('http');
const { readFile } = require('fs');

const { Resolvers, REST, Endpoints } = require('./endpoints/index.js');

const LOG = console.log;
const WARN = console.warn;

class EZServerApp {
  resolvers = new Resolvers();
  rest = new REST();
  endpoints = new Endpoints();

  /** @param {string} port port the server is hosted on */
  constructor(port) {
    this.httpServer = createServer((req, res) => {
      (this.resolvers.getResFunction(req) || this.rest.getResFunction(req) || this.endpoints.getResFunction(req) || this.throw404)(req, res);
    });

    this.httpServer.listen(port);
  }

  /**
   * @param {import('http').IncomingMessage} req request from the client
   * @param {import('http').ServerResponse} res response from the server
   * @returns {void}
   */
  throw404(req, res) {
    WARN('404 on', req.url);
    serveFromFS(res, './html/404.html', 404);
  }
}

/**
 * @param {import('http').ServerResponse} res response the from Server
 * @param {string} filePath path of file
 * @param {number} statusCode status code of the response (default 200)
 * @returns {void}
 */
function serveFromFS(res, filePath, statusCode = 200) {
  LOG('reading file from FS:', filePath);
  readFile(filePath, (err, data) => {
    const header = !err ? { code: statusCode, mime: getType(filePath) } : { code: 500, mime: 'text/plain' };
    buildRes(res, data || `error while loading file from fs:\n${err}`, header);
  });
}

/**
 * @param {import('http').ServerResponse} res respnose from the server
 * @param {any} data data of the response
 * @param {object} options options
 * @param {number} options.code status code of the response
 * @param {string} options.mime mime type of the response
 * @returns {void}
 */
function buildRes(res, data, { code, mime }) {
  res.writeHead(code, { 'Content-Type': mime });
  res.write(data);
  res.end();
}

const mimeTypes = require('./mimeTypes.json');

/**
 * @param {string} filePath path of file
 * @returns {string} mimeType fo the file
 */
function getType(filePath) {
  return mimeTypes[filePath.split('.').pop()] || WARN('mime-type not found') || 'text/plain';
}

module.exports = { App: EZServerApp, serveFromFS, buildRes, getType };

