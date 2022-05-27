const { createServer } = require('http');
const { readFile } = require('fs');

const { Endpoints } = require('./endpoints/Endpoints');
const { REST } = require('./endpoints/REST');

class EZServerApp {
  /**
   * @param {string} port port the server is hosted on
   */
  constructor(port) {
    /** @type {Object<string, function>} */
    this.resolvers = {};
    /** @type {Object<string, function>} */
    this.groupResFunctions = {};

    this.endpoints = new Endpoints();
    this.rest = new REST();

    this.httpServer = createServer((req, res) => {
      (this.resolvers[req.url] || this.endpoints.getRes(req) || this.rest.getRes(req) || this.throw404)(req, res);
    });

    this.httpServer.listen(port);
  }

  /**
   * @param {string} reqPath path of requested URL
   * @param {function} resFunction function to resolve the request
   */
  addResolver(reqPath, resFunction) {
    this.resolvers[reqPath] = resFunction;
  }

  /**
   * @param {IncomingMessage} req Request from the client
   * @param {ServerResponse} res Respnose from the server
   */
  throw404(req, res) {
    console.log('404 on', req.url);
    serveFromFS('./html/404.html', res);
  }
}

/**
 * @param {string} filePath path of file
 * @param {ServerResponse} res Response the from Server
 */
function serveFromFS(filePath, res) {
  console.log('reading file from FS:', filePath);
  readFile(filePath, (err, data) => {
    let header;

    if (err) {
      header = { code: 500, mime: 'text/plain' };
    } else if (filePath === './html/404.html') {
      header = { code: 404, mime: 'text/html' };
    } else {
      header = { code: 200, mime: getType(filePath) };
    }

    buildRes(res, data || `error while loading file from fs:\n${err}`, header);
  });
}

module.exports = { App: EZServerApp, serveFromFS };

const mimeTypes = require('./mimeTypes.json');

/**
 * @param {ServerResponse} res Respnose from the server
 * @param {any} data data of the response
 * @param {number} code http status code
 */
function buildRes(res, data, { code, mime }) {
  res.writeHead(code, { 'Content-Type': mime });
  res.write(data);
  res.end();
}

/**
 * @param {string} filePath Path of file
 * @returns {string} mimeType fo the file
 */
function getType(filePath) {
  return mimeTypes[filePath.split('.').pop()] || console.warn('mime-type not found') || 'text/plain';
}

