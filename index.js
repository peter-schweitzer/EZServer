const { createServer, IncomingMessage, ServerResponse } = require('http');

const LOG = console.log;
const WARN = console.warn;

class App {
  /** @type {string[]} */
  m_methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  //#region endpoints
  m_restEndpoints = {
    /** @type {resolvers} */
    GET: {},
    /** @type {resolvers} */
    POST: {},
    /** @type {resolvers} */
    PUT: {},
    /** @type {resolvers} */
    DELETE: {},
    /** @type {resolvers} */
    PATCH: {},
  };

  /** @type {resolvers} */
  m_endpoints = {};
  //#endregion

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

  //#region endpoints
  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   * @returns {void}
   */
  get(route, fn) {
    this.m_restEndpoints.GET[route] = fn;
    LOG('added get:', route);
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   * @returns {void}
   */
  post(route, fn) {
    this.m_restEndpoints.POST[route] = fn;
    LOG('added post:', route);
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   * @returns {void}
   */
  put(route, fn) {
    this.m_restEndpoints.PUT[route] = fn;
    LOG('added put:', route);
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   * @returns {void}
   */
  delete(route, fn) {
    this.m_restEndpoints.DELETE[route] = fn;
    LOG('added delete:', route);
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   * @returns {void}
   */
  patch(route, fn) {
    this.m_restEndpoints.PATCH[route] = fn;
    LOG('added patch:', route);
  }

  /**
   * @param {IncomingMessage}
   * @returns {(resFunction|false)}
   */
  m_restEndpoint({ url, method }) {
    return this.m_methods.includes(method) ? this.m_restEndpoints[method][url] : WARN('invalid request method') && false;
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
  //#endregion
}

/**
 * @param {ServerResponse} res respnose from the server
 * @param {any} data data of the response
 * @param {Object} options options
 * @param {number} options.code status code of the response
 * @param {string} options.mime mime type of the response
 * @returns {void}
 */
function buildRes(res, data, { code, mime }) {
  res.writeHead(code, { 'Content-Type': mime });
  res.write(data);
  res.end();
}

/**
 * @param {IncomingMessage} req request from the client
 * @param {ServerResponse} res response from the server
 * @returns {void}
 */
function throw404(req, res) {
  WARN('404 on', req.url);
  buildRes(res, '<!DOCTYPE html><head><meta charset="UTF-8"><title>404</title></head><body><h1>ERROR</h1><p>404 not found.</p></body></html>', {
    code: 404,
    mime: 'text/html',
  });
}

const mimeTypes = require('./data/mimeTypes.json');

/**
 * @param {string} filePath path of file
 * @returns {string} mimeType fo the file
 */
function getType(filePath) {
  return mimeTypes[filePath.split('.').pop()] || WARN('mime-type not found') || 'text/plain';
}

/**
 * @param {ServerResponse} res response the from Server
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
 * @param {IncomingMessage} req
 * @return {Promise<{json: Object<string, any>, http_code: number}>}
 */
function getBodyJSON(req) {
  return new Promise((resolve) => {
    let buff = '';

    req.on('data', (chunk) => {
      buff += chunk;
    });

    req.on('end', () => {
      let json = { value: null };
      let resCode = 500; // internal server error as fallback; should always be overwritten

      try {
        json = JSON.parse(buff);
        resCode = req.method === 'PUT' ? 201 : 200;
      } catch (e) {
        WARN('error while parsing request body; sending code 400');
        console.error(e);
        resCode = 400;
      }

      resolve({ json: json, http_code: resCode });
    });
  });
}

module.exports = { App, buildRes, getType, serveFromFS, getBodyJSON };

/**
 * @callback resFunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {void}
 */

/** @typedef {Object.<string, resFunction>} resolvers */

