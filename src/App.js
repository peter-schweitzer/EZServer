//#region imports
import { createServer } from 'node:http';

import { Params } from './Params.js';
import { addEndpointWithOrWithoutParams, ERR, getResFunction, getResFunctionWithParams, HTTP_METHODS, LOG, throw404, WRN } from './utils.js';

//#endregion

export class App {
  /** @type {Server}*/
  m_http_server;

  //#region resolverLUT data-objects
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

  /** @type {resolverLUT} */
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

      const ez_incoming_msg = Object.assign({}, req, { uri });

      const parameters = new Params();
      if (!!query_str) parameters.add_query(query_str);

      (
        this.#rest_endpoint(ez_incoming_msg) ||
        this.#endpoint(ez_incoming_msg) ||
        this.#rest_endpoint_with_param(ez_incoming_msg, parameters) ||
        this.#endpoint_with_param(ez_incoming_msg, parameters) ||
        this.#rest_route(ez_incoming_msg) ||
        this.#route(ez_incoming_msg) ||
        throw404
      )(ez_incoming_msg, res, parameters);
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

  /** @returns {Promise<boolean>} never rejects; false if the server isn't open when close() is called */
  async close() {
    return await new Promise((resolve, _) => {
      this.m_http_server.close((err) => {
        if (err !== null) {
          ERR(err);
          resolve(false);
        } else {
          WRN('server is closed');
          resolve(true);
        }
      });
    });
  }
  //#endregion

  //#region endpoints
  //#region rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  get(uri, fn) {
    LOG('added get:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.GET, this.#rest_endpoints_with_params.GET, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  head(uri, fn) {
    LOG('added head:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.HEAD, this.#rest_endpoints_with_params.HEAD, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  post(uri, fn) {
    LOG('added post:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.POST, this.#rest_endpoints_with_params.POST, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  put(uri, fn) {
    LOG('added put:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.PUT, this.#rest_endpoints_with_params.PUT, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  delete(uri, fn) {
    LOG('added delete:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.DELETE, this.#rest_endpoints_with_params.DELETE, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  connect(uri, fn) {
    LOG('added connect:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.CONNECT, this.#rest_endpoints_with_params.CONNECT, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  options(uri, fn) {
    LOG('added options:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.OPTIONS, this.#rest_endpoints_with_params.OPTIONS, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  trace(uri, fn) {
    LOG('added trace:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.TRACE, this.#rest_endpoints_with_params.TRACE, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  patch(uri, fn) {
    LOG('added patch:', uri);
    addEndpointWithOrWithoutParams(this.#rest_endpoints.PATCH, this.#rest_endpoints_with_params.PATCH, uri, fn);
  }

  /**
   * @param {EZIncomingMessage} req
   * @returns {FalseOr<resFunction>}
   */
  #rest_endpoint({ uri, method }) {
    //@ts-ignore T1345
    return method in HTTP_METHODS ? this.#rest_endpoints[method][uri] : !!WRN('invalid request method');
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {Params} parameters
   * @returns {FalseOr<resFunction>}
   */
  #rest_endpoint_with_param({ uri, method }, parameters) {
    if (method in HTTP_METHODS) return getResFunctionWithParams(uri, this.#rest_endpoints_with_params[method], parameters);
    WRN('invalid request method');
    return false;
  }
  //#endregion

  //#region non rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  add(uri, fn) {
    LOG('added:', uri);
    addEndpointWithOrWithoutParams(this.#endpoints, this.#endpoints_with_params, uri, fn);
  }

  /**
   * @param {EZIncomingMessage} req
   * @returns {FalseOr<resFunction>}
   */
  #endpoint({ uri }) {
    return this.#endpoints.hasOwnProperty(uri) ? this.#endpoints[uri] : false;
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {Params} parameters
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
   * @returns {FalseOr<void>} wether the function was successfully registered
   */
  addRestRoute(method, uri, fn) {
    const m = method.toUpperCase();
    if (!(m in HTTP_METHODS)) {
      WRN('invalid method', m);
      return false;
    }

    LOG(`adding rest-route '${uri}' for method '${m}'`);
    this.#rest_routes[m][uri] = fn;
  }

  /**
   * @param {EZIncomingMessage} req
   * @returns {FalseOr<resFunction>}
   */
  #rest_route(req) {
    if (HTTP_METHODS.hasOwnProperty(req.method)) return getResFunction(req, this.#rest_routes[req.method]);

    WRN('invalid request method');
    return false;
  }
  //#endregion

  //#region non rest routes
  /**
   * @param {string} uri start of the uri to resolve
   * @param {resFunction} fn function for resolve the request
   * @returns {void}
   */
  addRoute(uri, fn) {
    LOG('adding route', uri);
    this.#routs[uri] = fn;
  }

  /**
   * @param {EZIncomingMessage} req
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
   * @returns {FalseOr<void>} wether the function was successfully registered
   */
  addGenericRestFunction(method, functionName = '', fn) {
    const m = method.toUpperCase();

    if (!(m in HTTP_METHODS)) {
      WRN('invalid method', m);
      return false;
    }

    if (!functionName.length) {
      WRN(`invalid functionName '${functionName}'`);
      return false;
    }

    LOG('adding generic rest function for method ' + method, functionName);
    this.#generic_rest_functions[m][functionName] = fn;
  }

  /**
   * @param {string} method http-method
   * @param {string} functionName name of the generic function
   * @param {string} uri uri to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {FalseOr<void>} wether the function was successfully registered
   */
  useGenericRestFunction(method, functionName, uri, isRoute = false) {
    const m = method.toUpperCase();
    if (!(m in HTTP_METHODS)) {
      WRN('invalid method', m);
      return false;
    }

    const fn = this.#generic_rest_functions[m][functionName];
    if (!fn) {
      WRN('invalid function name');
      return false;
    }

    if (isRoute) this.#rest_routes[m][uri] = fn;
    else this.#rest_endpoints[m][uri] = fn;
  }
  //#endregion

  //#region generic non rest functions
  /**
   * @param {string} functionName name of the generic function
   * @param {resFunction} fn function for resolve the request
   * @returns {FalseOr<void>} wether the function was successfully registered
   */
  addGenericFunction(functionName = '', fn) {
    if (!functionName.length) {
      WRN('invalid functionName', functionName);
      return false;
    }
    this.#generic_functions[functionName] = fn;
  }

  /**
   * @param {string} functionName name of the generic function
   * @param {string} uri uri to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {FalseOr<void>} wether the function was successfully registered
   */
  useGenericFunction(functionName, uri, isRoute = false) {
    const fn = this.#generic_functions[functionName];
    if (!fn) {
      WRN('invalid function name');
      return false;
    }

    if (isRoute) this.#routs[uri] = fn;
    else this.#endpoints[uri] = fn;
  }
  //#endregion
  //#endregion
  //#endregion
}
