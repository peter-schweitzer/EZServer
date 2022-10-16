'use strict';
const { createServer } = require('node:http');
const { readFile } = require('node:fs');

/** @type {Object.<string, string>} */
const mimeTypes = require('./data/mimeTypes.json');
const http_methods = { GET: 'GET', HEAD: 'HEAD', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE', CONNECT: 'CONNECT', OPTIONS: 'OPTIONS', TRACE: 'TRACE', PATCH: 'PATCH' };

const LOG = console.log;
const WRN = console.warn;
const ERR = console.error;

class Parameters {
  /** @type {params} */
  m_parameters = { query: {} };

  /** @param {string} query_string */
  m_add_query(query_string) {
    if (query_string)
      for (const kv of query_string.split('&'))
        (([k, v]) => {
          if (k && v) this.m_parameters.query[decodeURIComponent(k)] = decodeURIComponent(v);
        })(kv.split('='));
  }

  constructor() {}

  /**
   * @param {string} name
   * @param {string?} defaultValue
   * @returns {string?}
   */
  query(name, defaultValue = null) {
    return this.m_parameters.query[name] || defaultValue;
  }

  /**
   * @param {string} name
   * @param {number?} fallback
   * @returns {number?}
   */
  queryInt(name, defaultValue = null) {
    try {
      return parseInt(this.query(name, defaultValue));
    } catch (e) {
      return ERR(e) || null;
    }
  }
}

class App {
  /** @type {Server}*/
  m_http_server;

  /** @type {resFunction} */
  m_404 = throw404;

  //#region resolverLUT data objects
  //#region endpoints
  /**@type {Object.<string, Object.<string, resFunction>>} */
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
  /**@type {Object.<string, Object.<string, resFunction>>} */
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
  /**@type {Object.<string, Object.<string, resFunction>>} */
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
  //#endregion

  constructor() {
    this.m_http_server = createServer((req, res) => {
      const parameters = new Parameters();

      const split_url = req.url.split('?');
      switch (split_url.length) {
        default:
          return buildRes(res, 'malformed URL', { code: 400, mime: 'text/plain' });
        case 2:
          parameters.m_add_query(split_url[1]);
        case 1:
          req.url = decodeURIComponent(split_url[0]);
      }

      (this.m_restEndpoint(req) || this.m_endpoints[req.url] || this.m_restRoute(req) || this.m_route(req) || this.m_404)(req, res, parameters);
    });
  }

  /**
   * @param {number|string} port port the server should listens on
   * @returns {void}
   */
  listen(port) {
    this.m_http_server.listen(port);
  }

  /** @returns {void} */
  close() {
    this.m_http_server.close(() => WRN('server was closed'));
  }

  //#region endpoints
  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  get(route, fn) {
    LOG('added get:', route);
    return !!(this.m_restEndpoints.GET[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  head(route, fn) {
    LOG('added head:', route);
    return !!(this.m_restEndpoints.HEAD[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  post(route, fn) {
    LOG('added post:', route);
    return !!(this.m_restEndpoints.POST[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  put(route, fn) {
    LOG('added put:', route);
    return !!(this.m_restEndpoints.PUT[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  delete(route, fn) {
    LOG('added delete:', route);
    return !!(this.m_restEndpoints.DELETE[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  connect(route, fn) {
    LOG('added connect:', route);
    return !!(this.m_restEndpoints.CONNECT[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  options(route, fn) {
    LOG('added options:', route);
    return !!(this.m_restEndpoints.OPTIONS[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  trace(route, fn) {
    LOG('added trace:', route);
    return !!(this.m_restEndpoints.TRACE[route] = fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  patch(route, fn) {
    LOG('added patch:', route);
    return !!(this.m_restEndpoints.PATCH[route] = fn);
  }

  /**
   * @param {IncomingMessage}
   * @returns {resFunction | false}
   */
  m_restEndpoint({ url, method }) {
    return method in http_methods ? this.m_restEndpoints[method][url] : !!WRN('invalid request method');
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
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
   * @returns {boolean} wether the function was successfully registered
   */
  addRestRoute(method, route, fn) {
    const m = method.toUpperCase();
    if (!(m in http_methods)) return !!WRN('invalid method', m);

    LOG('adding rest-route for method ' + m, route);
    return !!(route.includes(':') ? false : (this.m_restRouts[m][route] = fn));
  }

  /**
   * @param {IncomingMessage} req
   * @returns {(resFunction|false)}
   */
  m_restRoute(req) {
    return req.method in http_methods ? getResFunction(req, this.m_restRouts[req.method]) : !!WRN('invalid request method');
  }

  /**
   * @param {string} url start of the route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
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
   * @returns {boolean} wether the function was successfully registered
   */
  addGenericRestFunction(method, functionName, fn) {
    const m = method.toUpperCase();
    if (!(m in http_methods)) return !!WRN('invalid method', m);
    if (!functionName) return !!WRN('invalid functionName', functionName);
    return LOG('adding generic rest function for method ' + method, functionName) || !(this.m_genericRestFunctions[m][functionName] = fn);
  }

  /**
   * @param {string} method http-method
   * @param {string} functionName name of the generic function
   * @param {string} route route to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {boolean} wether the function was successfully registered
   */
  useGenericRestFunction(method, functionName, route, isRoute = false) {
    const m = method.toUpperCase();
    if (!(m in http_methods)) return !!WRN('invalid method', m);

    const fn = this.m_genericRestFunctions[m][functionName];
    if (!fn) return !!WRN('invalid function name');

    return !!(isRoute ? (this.m_restRouts[m][route] = fn) : (this.m_restEndpoints[m][route] = fn));
  }

  /**
   * @param {string} functionName name of the generic function
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  addGenericFunction(functionName, fn) {
    if (!functionName) return !!WRN('invalid functionName', functionName);
    return !!(this.m_genericFunctions[functionName] = fn);
  }

  /**
   * @param {string} functionName name of the generic function
   * @param {string} route route to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {boolean} wether the function was successfully registered
   */
  useGenericFunction(functionName, route, isRoute = false) {
    const fn = this.m_genericFunctions[functionName];
    if (!fn) return !!WRN('invalid function name');

    return !!(isRoute ? (this.m_routs[route] = fn) : (this.m_endpoints[route] = fn));
  }
  //#endregion
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
function buildRes(res, data, { code, mime } = { code: null, mime: null }) {
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
  WRN('404 on', req.url);
  buildRes(res, '<!DOCTYPE html><head><meta charset="UTF-8"><title>404</title></head><body><h1>ERROR</h1><p>404 not found.</p></body></html>', {
    code: 404,
    mime: 'text/html',
  });
}

/**
 * @param {string} filePathOrName path, or name of  the file
 * @returns {string} mime-type of the file (default 'text/plain')
 */
function getType(filePathOrName) {
  return mimeTypes[filePathOrName.split('.').pop()] || WRN('mime-type not found') || 'text/plain';
}

/**
 * @param {ServerResponse} res response from the Server
 * @param {string} filePath path of the file
 * @param {number} statusCode status code f thoe response (default 200)
 * @returns {void}
 */
function serveFromFS(res, filePath, statusCode = 200) {
  LOG('reading file from FS:', filePath);
  readFile(filePath, (err, data) => {
    const header = err ? { code: 500, mime: 'text/plain' } : { code: statusCode, mime: getType(filePath) };
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
        WRN('error while parsing request body; sending code 400');
        ERR(e);
        resCode = 400;
      }

      resolve({ json: json, http_code: resCode });
    });
  });
}
//#endregion

module.exports = { App, buildRes, getType, serveFromFS, getBodyJSON, throw404, METHODS: http_methods };

//#region typedef's
/**
 * @typedef {import('http').Server} Server
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 */

/**
 * @typedef {Object} params
 * @property {Object.<string, string>} query
 */

/**
 * @callback resFunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {Parameters} parameters
 * @returns {void}
 */

/** @typedef {Object.<string, resFunction>} resolverLUT */
//#endregion
