const { createServer } = require('http');
const { readFile } = require('fs');

const { Endpoints, REST } = require('./endpoints/index.js');

const LOG = console.log;
const WARN = console.warn;

class EZServerApp {
  /** @param {string} port port the server is hosted on */
  constructor(port) {
    /** @type {Object<string, resFunction>} */
    this.resolvers = {};

    this.endpoints = new Endpoints();
    this.rest = new REST();

    this.httpServer = createServer((req, res) => {
      (this.resolvers[req.url] || this.rest.getRes(req) || this.endpoints.getRes(req) || this.throw404)(req, res);
    });

    this.httpServer.listen(port);
  }

  /**
   * @param {string} reqPath path of requested URL
   * @param {resFunction} resFunction function to resolve the request
   */
  addResolver(reqPath, resFunction) {
    this.resolvers[reqPath] = resFunction;
  }

  /**
   * @param {IncomingMessage} req Request from the client
   * @param {ServerResponse} res Respnose from the server
   */
  throw404(req, res) {
    WARN('404 on', req.url);
    serveFromFS('./html/404.html', res, 404);
  }
}

/**
 * @param {ServerResponse} res response the from Server
 * @param {string} filePath path of file
 * @param {number} statusCode status code of the response (default 200)
 */
function serveFromFS(res, filePath, statusCode = 200) {
  LOG('reading file from FS:', filePath);
  readFile(filePath, (err, data) => {
    const header = !err ? { code: statusCode, mime: getType(filePath) } : { code: 500, mime: 'text/plain' };
    buildRes(res, data || `error while loading file from fs:\n${err}`, header);
  });
}

/**
 * @param {ServerResponse} res Respnose from the server
 * @param {any} data data of the response
 * @param {object} options options
 * @param {number} options.code status code of the response
 * @param {string} options.mime mime type of the response
 */
function buildRes(res, data, { code, mime }) {
  res.writeHead(code, { 'Content-Type': mime });
  res.write(data);
  res.end();
}

const mimeTypes = require('./mimeTypes.json');

/**
 * @param {string} filePath Path of file
 * @returns {string} mimeType fo the file
 */
function getType(filePath) {
  return mimeTypes[filePath.split('.').pop()] || WARN('mime-type not found') || 'text/plain';
}

module.exports = { App: EZServerApp, serveFromFS, buildRes, getType };

/**
 * @typedef {import('./endpoints').resFunction} resFunction
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 */

