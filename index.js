'use strict';
//#region imports and global const's
const { createServer } = require('node:http');

const { Parameters } = require('./src/Parameters.js');
const {
  LOG,
  WRN,
  ERR,
  addEndpointWithOrWithoutParams,
  getResFunction,
  getResFunctionWithParams,
  getBodyJSON,
  getType,
  buildRes,
  serveFromFS,
  throw404,
  HTTP_METHODS,
} = require('./src/utils.js');

/** @type {import('./types')} */
//#endregion

class App {
  /** @type {Server}*/
  m_http_server;

  //#region resolverLUT data objects
  //#region endpoints
  //#region without param
  #rest_endpoints = {
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
  #endpoints = {};
  //#endregion

  //#region with param
  #rest_endpoints_with_params = {
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

  #endpoints_with_params = {};
  //#endregion
  //#endregion

  //#region routs
  #rest_routes = {
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
  #routs = {};
  //#endregion

  //#region general functions
  #generic_rest_functions = {
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
  #generic_functions = {};
  //#endregion
  //#endregion

  constructor() {
    this.m_http_server = createServer((req, res) => {
      const [uri, query_str] = decodeURIComponent(req.url).split('?');

      Object.defineProperty(req, 'uri', { value: uri });

      const parameters = new Parameters();
      if (!!query_str) parameters.add_query(query_str);

      (
        this.#rest_endpoint(req) ||
        this.#endpoint(req) ||
        this.#rest_endpoint_with_param(req, parameters) ||
        this.#endpoint_with_param(req, parameters) ||
        this.#rest_route(req) ||
        this.#route(req) ||
        throw404
      )(req, res, parameters);
    });
  }

  //#region functions
  //#region node:http Server functions
  /**
   * @param {number|string} port port the server will listen on
   * @returns {void}
   */
  listen(port) {
    this.m_http_server.listen(port, () => LOG(`server listening on port ${port}`));
  }

  /** @returns {boolean} false if the server isn't open when close is called */
  close() {
    new Promise((resolve, reject) => this.m_http_server.close((err) => (err ? reject('error on close', err) : resolve('server is closed'))))
      .catch((err) => {
        ERR(err);
        return false;
      })
      .then((wrn) => {
        WRN(wrn);
        return true;
      });
  }
  //#endregion

  //#region endpoints
  //#region rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  get(uri, fn) {
    LOG('added get:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.GET, this.#rest_endpoints_with_params.GET, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  head(uri, fn) {
    LOG('added head:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.HEAD, this.#rest_endpoints_with_params.HEAD, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  post(uri, fn) {
    LOG('added post:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.POST, this.#rest_endpoints_with_params.POST, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  put(uri, fn) {
    LOG('added put:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.PUT, this.#rest_endpoints_with_params.PUT, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  delete(uri, fn) {
    LOG('added delete:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.DELETE, this.#rest_endpoints_with_params.DELETE, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  connect(uri, fn) {
    LOG('added connect:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.CONNECT, this.#rest_endpoints_with_params.CONNECT, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  options(uri, fn) {
    LOG('added options:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.OPTIONS, this.#rest_endpoints_with_params.OPTIONS, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  trace(uri, fn) {
    LOG('added trace:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.TRACE, this.#rest_endpoints_with_params.TRACE, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  patch(uri, fn) {
    LOG('added patch:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.PATCH, this.#rest_endpoints_with_params.PATCH, uri, fn);
  }

  /**
   * @param {IncomingMessage}
   * @returns {FalseOr<resFunction>}
   */
  #rest_endpoint({ uri, method }) {
    return method in HTTP_METHODS ? this.#rest_endpoints[method][uri] : !!WRN('invalid request method');
  }

  /**
   * @param {IncomingMessage}
   * @param {Parameters} parameters
   * @returns {FalseOr<resFunction>}
   */
  #rest_endpoint_with_param({ uri, method }, parameters) {
    return method in HTTP_METHODS ? getResFunctionWithParams(uri, this.#rest_endpoints_with_params[method], parameters) : !!WRN('invalid request method');
  }
  //#endregion

  //#region non rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  add(uri, fn) {
    LOG('added:', uri);
    addEndpointWithOrWithoutParams(this.#endpoints, this.#endpoints_with_params, uri, fn);
  }

  /**
   * @param {IncomingMessage}
   * @returns {FalseOr<resFunction>}
   */
  #endpoint({ uri }) {
    return this.#endpoints.hasOwnProperty(uri) ? this.#endpoints[uri] : false;
  }

  /**
   * @param {IncomingMessage}
   * @param {Parameters}
   * @returns {FalseOr<resFunction>}
   */
  #endpoint_with_param({ uri }, parameters) {
    return getResFunctionWithParams(uri, this.#endpoints_with_params, parameters);
  }
  //#endregion
  //#endregion

  //#region routs
  //#region rest routs
  /**
   * @param {string} method http-method of the request
   * @param {string} uri start of the uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  addRestRoute(method, uri, fn) {
    const m = method.toUpperCase();
    if (!m in HTTP_METHODS) return !!WRN('invalid method', m);

    LOG('adding rest-route for method ' + m, uri);
    return !!(this.#rest_routes[m][uri] = fn);
  }

  /**
   * @param {IncomingMessage} req
   * @returns {FalseOr<resFunction>}
   */
  #rest_route(req) {
    return HTTP_METHODS.hasOwnProperty(req.method) ? getResFunction(req, this.#rest_routes[req.method]) : !!WRN('invalid request method');
  }
  //#endregion

  //#region non rest routes
  /**
   * @param {string} uri start of the uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  addRoute(uri, fn) {
    LOG('adding route', uri);
    return !!(this.#routs[uri] = fn);
  }

  /**
   * @param {IncomingMessage} req
   * @returns {FalseOr<resFunction>}
   */
  #route(req) {
    return getResFunction(req, this.#routs);
  }
  //#endregion
  //#endregion

  //#region generic functions
  //#region generic rest functions
  /**
   * @param {string} method http-method
   * @param {string} functionName name of the generic function
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  addGenericRestFunction(method, functionName, fn) {
    const m = method.toUpperCase();
    if (!(m in HTTP_METHODS)) return !!WRN('invalid method', m);
    if (!functionName) return !!WRN('invalid functionName', functionName);
    return LOG('adding generic rest function for method ' + method, functionName) || !(this.#generic_rest_functions[m][functionName] = fn);
  }

  /**
   * @param {string} method http-method
   * @param {string} functionName name of the generic function
   * @param {string} uri uri to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {boolean} wether the function was successfully registered
   */
  useGenericRestFunction(method, functionName, uri, isRoute = false) {
    const m = method.toUpperCase();
    if (!(m in HTTP_METHODS)) return !!WRN('invalid method', m);

    const fn = this.#generic_rest_functions[m][functionName];
    if (!fn) return !!WRN('invalid function name');

    return !!(isRoute ? (this.#rest_routes[m][uri] = fn) : (this.#rest_endpoints[m][uri] = fn));
  }
  //#endregion

  //#region generic non rest functions
  /**
   * @param {string} functionName name of the generic function
   * @param {resFunction} fn function for resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  addGenericFunction(functionName, fn) {
    if (!functionName) return !!WRN('invalid functionName', functionName);
    return !!(this.#generic_functions[functionName] = fn);
  }

  /**
   * @param {string} functionName name of the generic function
   * @param {string} uri uri to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {boolean} wether the function was successfully registered
   */
  useGenericFunction(functionName, uri, isRoute = false) {
    const fn = this.#generic_functions[functionName];
    if (!fn) return !!WRN('invalid function name');

    return !!(isRoute ? (this.#routs[uri] = fn) : (this.#endpoints[uri] = fn));
  }
  //#endregion
  //#endregion
  //#endregion
}

module.exports = { App, buildRes, getType, serveFromFS, getBodyJSON, throw404, HTTP_METHODS, Parameters };
