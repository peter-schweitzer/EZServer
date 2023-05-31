//#region imports
import { createServer } from 'node:http';

import { ERR, HTTP_METHODS, LOG, WRN, add_endpoint_with_or_without_params, get_ResFunction, get_ResFunction_with_params, throw404 } from './utils.js';

import { ParamsBuilder } from './ParamsBuilder.js';
//#endregion

export class App {
  /** @type {Server}*/
  m_http_server;

  //#region resolverLUT data-objects
  //#region endpoints
  //#region without param
  #rest_endpoints = {
    /** @type {ResolverLUT} */
    GET: {},
    /** @type {ResolverLUT} */
    HEAD: {},
    /** @type {ResolverLUT} */
    POST: {},
    /** @type {ResolverLUT} */
    PUT: {},
    /** @type {ResolverLUT} */
    DELETE: {},
    /** @type {ResolverLUT} */
    CONNECT: {},
    /** @type {ResolverLUT} */
    OPTIONS: {},
    /** @type {ResolverLUT} */
    TRACE: {},
    /** @type {ResolverLUT} */
    PATCH: {},
  };

  /** @type {ResolverLUT} */
  #endpoints = {};
  //#endregion

  //#region with param
  #rest_endpoints_with_params = {
    /** @type {ResolverLUT} */
    GET: {},
    /** @type {ResolverLUT} */
    HEAD: {},
    /** @type {ResolverLUT} */
    POST: {},
    /** @type {ResolverLUT} */
    PUT: {},
    /** @type {ResolverLUT} */
    DELETE: {},
    /** @type {ResolverLUT} */
    CONNECT: {},
    /** @type {ResolverLUT} */
    OPTIONS: {},
    /** @type {ResolverLUT} */
    TRACE: {},
    /** @type {ResolverLUT} */
    PATCH: {},
  };

  /** @type {ResolverLUT} */
  #endpoints_with_params = {};
  //#endregion
  //#endregion

  //#region routs
  #rest_routes = {
    /** @type {ResolverLUT} */
    GET: {},
    /** @type {ResolverLUT} */
    HEAD: {},
    /** @type {ResolverLUT} */
    POST: {},
    /** @type {ResolverLUT} */
    PUT: {},
    /** @type {ResolverLUT} */
    DELETE: {},
    /** @type {ResolverLUT} */
    CONNECT: {},
    /** @type {ResolverLUT} */
    OPTIONS: {},
    /** @type {ResolverLUT} */
    TRACE: {},
    /** @type {ResolverLUT} */
    PATCH: {},
  };

  /** @type {ResolverLUT} */
  #routs = {};
  //#endregion

  //#region general functions
  #generic_rest_functions = {
    /** @type {ResolverLUT} */
    GET: {},
    /** @type {ResolverLUT} */
    HEAD: {},
    /** @type {ResolverLUT} */
    POST: {},
    /** @type {ResolverLUT} */
    PUT: {},
    /** @type {ResolverLUT} */
    DELETE: {},
    /** @type {ResolverLUT} */
    CONNECT: {},
    /** @type {ResolverLUT} */
    OPTIONS: {},
    /** @type {ResolverLUT} */
    TRACE: {},
    /** @type {ResolverLUT} */
    PATCH: {},
  };

  /** @type {ResolverLUT}*/
  #generic_functions = {};
  //#endregion
  //#endregion

  constructor() {
    this.m_http_server = createServer((req, res) => {
      const [uri, query_str] = decodeURIComponent(req.url).split('?');

      const ez_incoming_msg = Object.assign({ uri }, req);

      const params_builder = new ParamsBuilder();
      params_builder.add_query_parameters(query_str);

      (
        this.#rest_endpoint(ez_incoming_msg) ||
        this.#endpoint(ez_incoming_msg) ||
        this.#rest_endpoint_with_param(ez_incoming_msg, params_builder) ||
        this.#endpoint_with_param(ez_incoming_msg, params_builder) ||
        this.#rest_route(ez_incoming_msg) ||
        this.#route(ez_incoming_msg) ||
        throw404
      )(ez_incoming_msg, res, params_builder.build());
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
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  get(uri, fn) {
    LOG('added get:', uri);
    add_endpoint_with_or_without_params(this.#rest_endpoints.GET, this.#rest_endpoints_with_params.GET, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  head(uri, fn) {
    LOG('added head:', uri);
    add_endpoint_with_or_without_params(this.#rest_endpoints.HEAD, this.#rest_endpoints_with_params.HEAD, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  post(uri, fn) {
    LOG('added post:', uri);
    add_endpoint_with_or_without_params(this.#rest_endpoints.POST, this.#rest_endpoints_with_params.POST, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  put(uri, fn) {
    LOG('added put:', uri);
    add_endpoint_with_or_without_params(this.#rest_endpoints.PUT, this.#rest_endpoints_with_params.PUT, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  delete(uri, fn) {
    LOG('added delete:', uri);
    add_endpoint_with_or_without_params(this.#rest_endpoints.DELETE, this.#rest_endpoints_with_params.DELETE, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  connect(uri, fn) {
    LOG('added connect:', uri);
    add_endpoint_with_or_without_params(this.#rest_endpoints.CONNECT, this.#rest_endpoints_with_params.CONNECT, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  options(uri, fn) {
    LOG('added options:', uri);
    add_endpoint_with_or_without_params(this.#rest_endpoints.OPTIONS, this.#rest_endpoints_with_params.OPTIONS, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  trace(uri, fn) {
    LOG('added trace:', uri);
    add_endpoint_with_or_without_params(this.#rest_endpoints.TRACE, this.#rest_endpoints_with_params.TRACE, uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  patch(uri, fn) {
    LOG('added patch:', uri);
    add_endpoint_with_or_without_params(this.#rest_endpoints.PATCH, this.#rest_endpoints_with_params.PATCH, uri, fn);
  }

  /**
   * @param {EZIncomingMessage} req
   * @returns {FalseOr<ResFunction>}
   */
  #rest_endpoint({ uri, method }) {
    //@ts-ignore T1345
    return method in HTTP_METHODS ? this.#rest_endpoints[method][uri] : !!WRN('invalid request method');
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {ParamsBuilder} params
   * @returns {FalseOr<ResFunction>}
   */
  #rest_endpoint_with_param({ uri, method }, params) {
    if (method in HTTP_METHODS) return get_ResFunction_with_params(uri, this.#rest_endpoints_with_params[method], params);
    WRN('invalid request method');
    return false;
  }
  //#endregion

  //#region non rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  add(uri, fn) {
    LOG('added:', uri);
    add_endpoint_with_or_without_params(this.#endpoints, this.#endpoints_with_params, uri, fn);
  }

  /**
   * @param {EZIncomingMessage} req
   * @returns {FalseOr<ResFunction>}
   */
  #endpoint({ uri }) {
    return Object.hasOwn(this.#endpoints, uri) ? this.#endpoints[uri] : false;
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {ParamsBuilder} params_builder
   * @returns {FalseOr<ResFunction>}
   */
  #endpoint_with_param({ uri }, params_builder) {
    return get_ResFunction_with_params(uri, this.#endpoints_with_params, params_builder);
  }
  //#endregion
  //#endregion

  //#region routs
  //#region rest routs
  /**
   * @param {string} method http-method of the request
   * @param {string} uri start of the uri to resolve
   * @param {ResFunction} fn function for resolve the request
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
   * @returns {FalseOr<ResFunction>}
   */
  #rest_route(req) {
    if (Object.hasOwn(HTTP_METHODS, req.method)) return get_ResFunction(req, this.#rest_routes[req.method]);

    WRN('invalid request method');
    return false;
  }
  //#endregion

  //#region non rest routes
  /**
   * @param {string} uri start of the uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  addRoute(uri, fn) {
    LOG('adding route', uri);
    this.#routs[uri] = fn;
  }

  /**
   * @param {EZIncomingMessage} req
   * @returns {FalseOr<ResFunction>}
   */
  #route(req) {
    return get_ResFunction(req, this.#routs);
  }
  //#endregion
  //#endregion

  //#region generic functions
  //#region generic rest functions
  /**
   * @param {string} method http-method
   * @param {string} functionName name of the generic function
   * @param {ResFunction} fn function for resolve the request
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
   * @param {ResFunction} fn function for resolve the request
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
