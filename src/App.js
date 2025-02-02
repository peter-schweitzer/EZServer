import { createServer } from 'node:http';

import { ERR, LOG, WRN } from '@peter-schweitzer/ez-utils';

import { curry_middleware, handle_middleware } from './middleware.js';
import { Params } from './Params.js';
import { add_endpoint_to_corresponding_lut, get_endpoint, get_endpoint_with_param, get_endpoint_with_wildcard } from './routing.js';
import { throw404 } from './utils.js';

export class App {
  /** @type {Server} */
  m_http_server;

  //#region endpoints
  /** @type {ResolverLUT} */
  #endpoints = {};

  /** @type {TreeNode<false>} */
  #endpoints_with_params = {};

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

  /** @type {Middleware[]} */
  #middleware = [];

  constructor() {
    this.m_http_server = createServer((/**@type {EZIncomingMessage}*/ req, res) => {
      //#region variables
      /** @type {LUT<string>} */
      const query = {};
      /**@type {LUT<string> & {"*"?: string[]}}*/
      const route = {};
      //#endregion

      //#region parsing out URL & query parameters
      const url = req.url;
      const uri_end_idx = url.indexOf('?');
      if (uri_end_idx === -1) req.uri = decodeURIComponent(url);
      else {
        req.uri = decodeURIComponent(url.slice(0, uri_end_idx));

        //#region parsing out query parameters
        const query_string = decodeURIComponent(url.slice(uri_end_idx + 1));
        if (query_string.length !== 0)
          for (const kv of query_string.split('&')) {
            const [key, value] = kv.split('=');
            if (key.length === 0 || value === undefined || value.length === 0) continue;
            else query[key] = value;
          }
        //#endregion
      }
      //#endregion

      //#region "global" middleware
      if (this.#middleware.length > 0 && !handle_middleware(this.#middleware, req, res, query, route)) return;
      //#endregion

      //#region routing
      const leaf =
        get_endpoint(this.#endpoints, req) ||
        get_endpoint_with_param(this.#endpoints_with_params, req, route) ||
        get_endpoint_with_wildcard(this.#rest_endpoints_with_wildcard[req.method], req, route) ||
        get_endpoint_with_wildcard(this.#endpoints_with_wildcard, req, route);

      if (leaf === false) return throw404(req, res);
      const { fn, middleware } = leaf;

      if (handle_middleware(middleware, req, res, query, route)) fn(req, res, new Params(query, route));
      //#endregion
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
        else ERR(err), WRN("'close()' called, but server is already closed"), resolve(false);
      });
    });
  }
  //#endregion

  //#region rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  get(uri, fn) {
    LOG('added get:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.GET, uri, fn, 'GET');
    return curry_middleware(leaf);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  head(uri, fn) {
    LOG('added head:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.HEAD, uri, fn, 'HEAD');
    return curry_middleware(leaf);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  post(uri, fn) {
    LOG('added post:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.POST, uri, fn, 'POST');
    return curry_middleware(leaf);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  put(uri, fn) {
    LOG('added put:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.PUT, uri, fn, 'PUT');
    return curry_middleware(leaf);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  delete(uri, fn) {
    LOG('added delete:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.DELETE, uri, fn, 'DELETE');
    return curry_middleware(leaf);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  connect(uri, fn) {
    LOG('added connect:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.CONNECT, uri, fn, 'CONNECT');
    return curry_middleware(leaf);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  options(uri, fn) {
    LOG('added options:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.OPTIONS, uri, fn, 'OPTIONS');
    return curry_middleware(leaf);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  trace(uri, fn) {
    LOG('added trace:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.TRACE, uri, fn, 'TRACE');
    return curry_middleware(leaf);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  patch(uri, fn) {
    LOG('added patch:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.PATCH, uri, fn, 'PATCH');
    return curry_middleware(leaf);
  }
  //#endregion

  //#region non rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {MiddlewareCurry}
   */
  add(uri, fn) {
    LOG('added:', uri);
    const leaf = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#endpoints_with_wildcard, uri, fn);
    return curry_middleware(leaf);
  }
  //#endregion
  //#endregion

  /**
   * @param {Middleware} middleware
   * @returns {this}
   */
  use(middleware) {
    this.#middleware.push(middleware);
    return this;
  }
}
