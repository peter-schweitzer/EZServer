//#region imports
import { createServer } from 'node:http';

import { ERR, LOG, WRN } from '@peter-schweitzer/ez-utils';

import { Params } from './Params.js';
import { add_endpoint_to_corresponding_lut, get_ResFunction_with_params, get_ResFunction_with_wildcard, set_query_parameters, throw404 } from './utils.js';
//#endregion

export class App {
  /** @type {Server}*/
  m_http_server;

  //#region endpoints
  //#region without param
  /** @type {{[x in Methods]: ResolverLUT}} */
  #rest_endpoints = {
    GET: {},
    HEAD: {},
    POST: {},
    PUT: {},
    DELETE: {},
    CONNECT: {},
    OPTIONS: {},
    TRACE: {},
    PATCH: {},
  };

  /** @type {ResolverLUT} */
  #endpoints = {};
  //#endregion

  //#region with param
  /** @type {{[x in Methods]: ResolverTree}} */
  #rest_endpoints_with_params = {
    GET: {},
    HEAD: {},
    POST: {},
    PUT: {},
    DELETE: {},
    CONNECT: {},
    OPTIONS: {},
    TRACE: {},
    PATCH: {},
  };

  /** @type {ResolverTree} */
  #endpoints_with_params = {};
  //#endregion

  //#region with wildcard
  /** @type {{[x in Methods]: ResolverTreeContainer}} */
  #rest_endpoints_with_wildcard = {
    GET: { depth: 0, root: {} },
    HEAD: { depth: 0, root: {} },
    POST: { depth: 0, root: {} },
    PUT: { depth: 0, root: {} },
    DELETE: { depth: 0, root: {} },
    CONNECT: { depth: 0, root: {} },
    OPTIONS: { depth: 0, root: {} },
    TRACE: { depth: 0, root: {} },
    PATCH: { depth: 0, root: {} },
  };

  /** @type {ResolverTreeContainer} */
  #endpoints_with_wildcard = { depth: 0, root: {} };
  //#endregion
  //#endregion

  constructor() {
    this.m_http_server = createServer((req, res) => {
      const [uri, query_str] = decodeURIComponent(req.url).split('?');

      /**@type {EZIncomingMessage}*/
      const ez_incoming_msg = Object.assign(req, { uri });

      const query = set_query_parameters(query_str);
      /**@type {LUT<string> & {"*"?: string[]}}*/
      const route = {};

      const fn =
        this.#rest_endpoint(ez_incoming_msg) ||
        this.#endpoint(ez_incoming_msg) ||
        this.#rest_endpoint_with_params(ez_incoming_msg, route) ||
        this.#endpoint_with_params(ez_incoming_msg, route) ||
        this.#rest_endpoint_with_wildcard(ez_incoming_msg, route) ||
        this.#endpoint_with_wildcard(ez_incoming_msg, route);

      if (fn === false) throw404(ez_incoming_msg, res);
      else fn(ez_incoming_msg, res, new Params(query, route));
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
    return new Promise((resolve, _) => {
      this.m_http_server.close(function (err = null) {
        if (err === null) WRN('server closed'), resolve(true);
        else ERR(err), WRN('server is closed'), resolve(false);
      });
    });
  }
  //#endregion

  //#region rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  get(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#rest_endpoints.GET, this.#rest_endpoints_with_params.GET, this.#rest_endpoints_with_wildcard.GET, uri, fn);
    LOG('added get:', uri);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  head(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#rest_endpoints.HEAD, this.#rest_endpoints_with_params.HEAD, this.#rest_endpoints_with_wildcard.HEAD, uri, fn);
    LOG('added head:', uri);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  post(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#rest_endpoints.POST, this.#rest_endpoints_with_params.POST, this.#rest_endpoints_with_wildcard.POST, uri, fn);
    LOG('added post:', uri);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  put(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#rest_endpoints.PUT, this.#rest_endpoints_with_params.PUT, this.#rest_endpoints_with_wildcard.PUT, uri, fn);
    LOG('added put:', uri);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  delete(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#rest_endpoints.DELETE, this.#rest_endpoints_with_params.DELETE, this.#rest_endpoints_with_wildcard.DELETE, uri, fn);
    LOG('added delete:', uri);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  connect(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#rest_endpoints.CONNECT, this.#rest_endpoints_with_params.CONNECT, this.#rest_endpoints_with_wildcard.CONNECT, uri, fn);
    LOG('added connect:', uri);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  options(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#rest_endpoints.OPTIONS, this.#rest_endpoints_with_params.OPTIONS, this.#rest_endpoints_with_wildcard.OPTIONS, uri, fn);
    LOG('added options:', uri);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  trace(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#rest_endpoints.TRACE, this.#rest_endpoints_with_params.TRACE, this.#rest_endpoints_with_wildcard.TRACE, uri, fn);
    LOG('added trace:', uri);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  patch(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#rest_endpoints.PATCH, this.#rest_endpoints_with_params.PATCH, this.#rest_endpoints_with_wildcard.PATCH, uri, fn);
    LOG('added patch:', uri);
  }

  /**
   * @param {EZIncomingMessage} req
   * @returns {FalseOr<ResFunction>}
   */
  #rest_endpoint({ uri, method: m }) {
    if (Object.hasOwn(this.#rest_endpoints[m], uri)) return this.#rest_endpoints[m][uri];
    else return false;
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {LUT<string>} route_params
   * @returns {FalseOr<ResFunction>}
   */
  #rest_endpoint_with_params({ uri, method: m }, route_params) {
    return get_ResFunction_with_params(uri, this.#rest_endpoints_with_params[m], route_params);
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {LUT<string> & {'*'?: string[]}} route_params
   * @returns {FalseOr<ResFunction>}
   */
  #rest_endpoint_with_wildcard({ uri, method: m }, route_params) {
    return get_ResFunction_with_wildcard(uri, this.#rest_endpoints_with_wildcard[m], route_params);
  }
  //#endregion

  //#region non rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  add(uri, fn) {
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#endpoints_with_wildcard, uri, fn);
    LOG('added:', uri);
  }

  /**
   * @param {EZIncomingMessage} req
   * @returns {FalseOr<ResFunction>}
   */
  #endpoint({ uri }) {
    if (Object.hasOwn(this.#endpoints, uri)) return this.#endpoints[uri];
    else return false;
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {LUT<string>} route_params
   * @returns {FalseOr<ResFunction>}
   */
  #endpoint_with_params({ uri }, route_params) {
    return get_ResFunction_with_params(uri, this.#endpoints_with_params, route_params);
  }

  /**
   * @param {EZIncomingMessage} req
   * @param {LUT<string> & {'*'?: string[]}} route_params
   * @returns {FalseOr<ResFunction>}
   */
  #endpoint_with_wildcard({ uri }, route_params) {
    return get_ResFunction_with_wildcard(uri, this.#endpoints_with_wildcard, route_params);
  }
  //#endregion
  //#endregion
}
