const { createServer, IncomingMessage, ServerResponse } = require('http');
const { readFile } = require('fs');

const LOG = console.log;
const WARN = console.warn;
const ERR = console.error;

class App {
  /** @type {string[]} */
  m_methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  //#region endpoints
  m_restEndpoints = {
    /** @type {resolverLUT} */
    GET: {},
    /** @type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /** @type {resolverLUT} */
    PATCH: {},
  };

  /** @type {resolverLUT} */
  m_endpoints = {};
  //#endregion

  //#region routs
  m_restRouts = {
    /** @type {resolverLUT} */
    GET: {},
    /**@type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /**@type {resolverLUT} */
    PATCH: {},
  };

  /** @type {resolverLUT} */
  m_routs = {};
  //#endregion

  //#region general functions
  m_genericRestFunctions = {
    /** @type {resolverLUT} */
    GET: {},
    /**@type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /**@type {resolverLUT} */
    PATCH: {},
  };

  /**@type {resolverLUT}*/
  m_genericFunctions = {};
  //#endregion

  constructor() {
    this.m_httpServer = createServer((req, res) => {
      req.url = decodeURIComponent(req.url);
      (this.m_restEndpoint(req) || this.m_endpoints[req.url] || this.m_restRoute(req) || this.m_route(req) || throw404)(req, res);
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

  //#region routs
  /**
   * @param {string} method http-method
   * @param {string} route pattern of requested URL
   * @param {resFunction} fn function to resolve the request
   * @returns {void}
   */
  addRestRoute(method, route, fn) {
    const m = method.toUpperCase();
    return !!(this.m_methods.includes(m) ? (this.m_restRouts[m][route] = fn) : WARN('invalid method', m) && false);
    LOG('added rest-route for' + m, route);
  }

  /**
   * @param {IncomingMessage} req
   * @returns {(resFunction|false)}
   */
  m_restRoute(req) {
    return this.m_methods.includes(req.method) ? getResFunction(req, this.m_restRouts[req.method]) : WARN('invalid request method');
  }

  /**
   * @param {string} url pattern of requested URL
   * @param {resFunction} fn function to resolve the request
   * @returns {void}
   */
  addRoute(route, fn) {
    this.m_routs[route] = fn;
    LOG('added route', route);
  }

  /**
   * @param {IncomingMessage} req
   * @returns {(resFunction|false)}
   */
  m_route(req) {
    return getResFunction(req, this.m_routs);
  }
  //#endregion

  //#region generic functions
  /**
   * @param {string} method http-method
   * @param {string} functionName name of the new group
   * @param {resFunction} fn function to resolve the requests
   * @returns {void}
   */
  addGenericRestFunction(method, functionName, fn) {
    const m = method.toUpperCase();
    if (!this.m_methods.includes(m)) return WARN('invalid method', m);
    if (!functionName) return WARN('invalid functionName', functionName);
    this.m_genericRestFunctions[m][functionName] = fn;
    LOG('added generic rest function for ' + method, functionName);
  }

  /**
   * @param {string} method URL of the endpoint
   * @param {string} functionName name of the functioin
   * @param {string} url URL of the endpoint
   * @param {boolean} isRoute
   * @returns {void}
   */
  useGenericRestFunction(method, functionName, url, isRoute = false) {
    const m = method.toUpperCase();
    if (!this.m_methods.includes(m)) return WARN('invalid method', m);

    const fn = this.m_genericRestFunctions[m][functionName];
    if (!fn) return WARN('invalid function name');

    isRoute ? (this.m_restRouts[m][url] = fn) : (this.m_restEndpoints[m][url] = fn);
  }

  /**
   * @param {string} functionName name of the functioin
   * @param {resFunction} fn function to resolve the requests
   * @returns {void}
   */
  addGenericFunction(functionName, fn) {
    this.m_genericFunctions[functionName] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {string} functionName name of the functioin
   * @param {boolean} isRoute
   * @returns {void}
   */
  useGenericFunction(functionName, url, isRoute = false) {
    const fn = this.m_genericFunctions[functionName];
    if (!fn) return WARN('invalid function name');
    isRoute ? (this.m_routs[url] = fn) : (this.m_endpoints[url] = fn);
  }
  //#endregion
}

/**
 * @param {IncomingMessage} req
 * @param {resolverLUT} resolvers
 * @returns {resFunction}
 */
function getResFunction(req, resolvers) {
  let ss = req.url.split('/');
  for (; ss.length > 1; ss.pop()) {
    let path = ss.join('/');
    if (resolvers.hasOwnProperty(path)) return resolvers[path];
  }
  return resolvers['/'] || false;
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
  res.writeHead(code || 200, { 'Content-Type': mime || 'text/plain' });
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
        ERR(e);
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

/** @typedef {Object.<string, resFunction>} resolverLUT */

