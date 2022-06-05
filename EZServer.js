import { createServer } from 'http';
import { readFile } from 'fs';

import { Endpoints, REST } from './endpoints/index.js';

const LOG = console.log;
const WARN = console.warn;

class EZServerApp {
  /**
   * @param {string} port port the server is hosted on
   */
  constructor(port) {
    /** @type {Object<string, resfunction>} */
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
   * @param {resfunction} resFunction function to resolve the request
   */
  addResolver(reqPath, resFunction) {
    this.resolvers[reqPath] = resFunction;
  }

  /**
   * @param {IncomingMessage} req Request from the client
   * @param {ServerResponse} res Respnose from the server
   */
  throw404(req, res) {
    LOG('404 on', req.url);
    serveFromFS('./html/404.html', res);
  }
}

/**
 * @param {string} filePath path of file
 * @param {ServerResponse} res Response the from Server
 */
function serveFromFS(filePath, res) {
  LOG('reading file from FS:', filePath);
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

import * as mimeTypes from './mimeTypes.json' assert { type: 'json' };

/**
 * @param {string} filePath Path of file
 * @returns {string} mimeType fo the file
 */
function getType(filePath) {
  return mimeTypes[filePath.split('.').pop()] || WARN('mime-type not found') || 'text/plain';
}

export { EZServerApp as App, serveFromFS, buildRes, getType };

/**
 * @callback resfunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */

