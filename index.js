const { createServer, Server, IncomingMessage, ServerResponse } = require('node:http');
const { readFile } = require('node:fs');

const mimeTypes = require('./data/mimeTypes.json');

const LOG = console.log;
const WARN = console.warn;
const ERR = console.error;

class App {
  /** @type {string[]} */
  m_methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'];

  //#region endpoints
  m_restEndpoints = {
    /** @type {resolverLUT} */
    GET: {},
    /** @type {resolverLUT} */
    HEAD: {},
    /** @type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /** @type {resolverLUT} */
    CONNECT: {},
    /** @type {resolverLUT} */
    OPTIONS: {},
    /** @type {resolverLUT} */
    TRACE: {},
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
    /** @type {resolverLUT} */
    HEAD: {},
    /** @type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /** @type {resolverLUT} */
    CONNECT: {},
    /** @type {resolverLUT} */
    OPTIONS: {},
    /** @type {resolverLUT} */
    TRACE: {},
    /** @type {resolverLUT} */
    PATCH: {},
  };

  /** @type {resolverLUT} */
  m_routs = {};
  //#endregion

  //#region general functions
  m_genericRestFunctions = {
    /** @type {resolverLUT} */
    GET: {},
    /** @type {resolverLUT} */
    HEAD: {},
    /** @type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /** @type {resolverLUT} */
    CONNECT: {},
    /** @type {resolverLUT} */
    OPTIONS: {},
    /** @type {resolverLUT} */
    TRACE: {},
    /** @type {resolverLUT} */
    PATCH: {},
  };

  /** @type {resolverLUT}*/
  m_genericFunctions = {};
  //#endregion

  /** @type {Server}*/
  m_httpServer;
  constructor() {
    this.m_httpServer = createServer((req, res) => {
      req.url = decodeURIComponent(req.url);
      (this.m_restEndpoint(req) || this.m_endpoints[req.url] || this.m_restRoute(req) || this.m_route(req) || this.m_404)(req, res);
    });
  }

  /** @param {number|string} port port the server listens on */
  listen(port) {
    this.m_httpServer.listen(port);
  }

  /** @param {number|string} port port the server listens on */
  kill() {
    this.m_httpServer.close(() => WARN('server was killed'));
  }

  //#region endpoints
  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  get(route, fn) {
    LOG('added get:', route);
    return !!(this.m_restEndpoints.GET[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  head(route, fn) {
    LOG('added head:', route);
    return !!(this.m_restEndpoints.HEAD[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  post(route, fn) {
    LOG('added post:', route);
    return !!(this.m_restEndpoints.POST[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  put(route, fn) {
    LOG('added put:', route);
    return !!(this.m_restEndpoints.PUT[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  delete(route, fn) {
    LOG('added delete:', route);
    return !!(this.m_restEndpoints.DELETE[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  connect(route, fn) {
    LOG('added connect:', route);
    return !!(this.m_restEndpoints.CONNECT[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  options(route, fn) {
    LOG('added options:', route);
    return !!(this.m_restEndpoints.OPTIONS[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  trace(route, fn) {
    LOG('added trace:', route);
    return !!(this.m_restEndpoints.TRACE[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  patch(route, fn) {
    LOG('added patch:', route);
    return !!(this.m_restEndpoints.PATCH[route] = fn);
  }

  /**
   * @param {IncomingMessage}
   * @returns {(resFunction|false)}
   */
  m_restEndpoint({ url, method }) {
    return this.m_methods.includes(method) ? this.m_restEndpoints[method][url] : !!WARN('invalid request method');
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  add(route, fn) {
    LOG('added:', route);
    return !!(this.m_endpoints[route] = fn);
  }
  //#endregion

  //#region routs
  /**
   * @param {string} method http-method of the request
   * @param {string} route start of the route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  addRestRoute(method, route, fn) {
    const m = method.toUpperCase();
    if (!this.m_methods.includes(m)) return !!WARN('invalid method', m);

    LOG('adding rest-route for method ' + m, route);
    return !!(this.m_restRouts[m][route] = fn);
  }

  /**
   * @param {IncomingMessage} req
   * @returns {(resFunction|false)}
   */
  m_restRoute(req) {
    return this.m_methods.includes(req.method) ? getResFunction(req, this.m_restRouts[req.method]) : !!WARN('invalid request method');
  }

  /**
   * @param {string} url start of the route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  addRoute(route, fn) {
    LOG('adding route', route);
    return !!(this.m_routs[route] = fn);
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
   * @param {string} functionName name of the generic function
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  addGenericRestFunction(method, functionName, fn) {
    const m = method.toUpperCase();
    if (!this.m_methods.includes(m)) return !!WARN('invalid method', m);
    if (!functionName) return !!WARN('invalid functionName', functionName);
    return LOG('adding generic rest function for method ' + method, functionName) || !(this.m_genericRestFunctions[m][functionName] = fn);
  }

  /**
   * @param {string} method http-method
   * @param {string} functionName name of the generic function
   * @param {string} route route to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {boolean}
   */
  useGenericRestFunction(method, functionName, route, isRoute = false) {
    const m = method.toUpperCase();
    if (!this.m_methods.includes(m)) return !!WARN('invalid method', m);

    const fn = this.m_genericRestFunctions[m][functionName];
    if (!fn) return !!WARN('invalid function name');

    return !!(isRoute ? (this.m_restRouts[m][route] = fn) : (this.m_restEndpoints[m][route] = fn));
  }

  /**
   * @param {string} functionName name of the generic function
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean}
   */
  addGenericFunction(functionName, fn) {
    if (!functionName) return !!WARN('invalid functionName', functionName);
    return !!(this.m_genericFunctions[functionName] = fn);
  }

  /**
   * @param {string} functionName name of the generic function
   * @param {string} route route to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {boolean}
   */
  useGenericFunction(functionName, route, isRoute = false) {
    const fn = this.m_genericFunctions[functionName];
    if (!fn) return !!WARN('invalid function name');

    return !!(isRoute ? (this.m_routs[route] = fn) : (this.m_endpoints[route] = fn));
  }
  //#endregion

  m_404 = throw404;
}

//#region util-functions
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
 * @param {Object} options optional options
 * @param {number} options.code status code of the response (default is 200)
 * @param {string} options.mime mime-type of the response (default is 'text/plain')
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

/**
 * @param {string} filePath path of file
 * @returns {string} mime-type fo the file
 */
function getType(filePath) {
  return mimeTypes[filePath.split('.').pop()] || WARN('mime-type not found') || 'text/plain';
}

/**
 * @param {ServerResponse} res response from the Server
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
//#endregion

module.exports = { App, buildRes, getType, serveFromFS, getBodyJSON, throw404 };

/**
 * @callback resFunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @returns {void}
 */

/** @typedef {Object.<string, resFunction>} resolverLUT */
