import { createServer } from 'node:http';

import { data, err, ERR, LOG, WRN } from '@peter-schweitzer/ez-utils';

import { CurryedMiddleware, handle_middleware } from './middleware.js';
import { Params } from './Params.js';
import { add_endpoint_to_corresponding_lut, get_endpoint, get_endpoint_with_param, get_endpoint_with_wildcard } from './routing.js';
import { throw404 } from './utils.js';

export class App {
  /** @type {Server} */
  m_http_server;

  //#region endpoints
  /** @type {ResolverLUT} */
  #endpoints = {};

  /** @type {TreeNode} */
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

  //#region middleware
  /** @type {FalseOr<Middleware[]>} */
  #middleware = false;
  //#endregion

  constructor() {
    this.m_http_server = createServer(async (/**@type {EZIncomingMessage}*/ req, res) => {
      //#region variables
      /** @type {LUT<string>} */
      const query = {};
      /**@type {RouteLUT}*/
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
      if (!(await handle_middleware(this.#middleware, req, res, query, route))) return;
      //#endregion

      //#region routing
      const leaf =
        get_endpoint(this.#endpoints, req) ||
        get_endpoint_with_param(this.#endpoints_with_params, req, route) ||
        get_endpoint_with_wildcard(this.#rest_endpoints_with_wildcard[req.method], req, route) ||
        get_endpoint_with_wildcard(this.#endpoints_with_wildcard, req, route);

      if (leaf === false) return throw404(req, res);

      const { fn, middleware } = leaf;
      if (await handle_middleware(middleware, req, res, query, route)) fn(req, res, new Params(query, route));
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
      this.m_http_server.close(function (err) {
        if (err === undefined) (WRN('server closed'), resolve(true));
        else (ERR(err), WRN("'close()' called, but server is already closed"), resolve(false));
      });
    });
  }
  //#endregion

  /**
   * @param {Methods} method
   * @param {string} uri
   * @param {ResFunction} fn
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  #register_rest_endpoint(method, uri, fn) {
    const { err: adding_error, data: leaf } = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard[method], uri, fn, method);
    if (adding_error !== null) return (LOG(`error while adding '${uri}'`), err(`error while adding '${method} ${uri}':\n  ${adding_error}`));

    LOG(`added ${method.toLowerCase()}: '${uri}'`);
    return data(new CurryedMiddleware(leaf));
  }

  //#region rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  get(uri, fn) {
    return this.#register_rest_endpoint('GET', uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  head(uri, fn) {
    return this.#register_rest_endpoint('HEAD', uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  post(uri, fn) {
    return this.#register_rest_endpoint('POST', uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  put(uri, fn) {
    return this.#register_rest_endpoint('PUT', uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  delete(uri, fn) {
    return this.#register_rest_endpoint('DELETE', uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  connect(uri, fn) {
    return this.#register_rest_endpoint('CONNECT', uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  options(uri, fn) {
    return this.#register_rest_endpoint('OPTIONS', uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  trace(uri, fn) {
    return this.#register_rest_endpoint('TRACE', uri, fn);
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  patch(uri, fn) {
    return this.#register_rest_endpoint('PATCH', uri, fn);
  }
  //#endregion

  //#region non rest endpoints
  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  add(uri, fn) {
    const { err: adding_error, data: leaf } = add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#endpoints_with_wildcard, uri, fn);
    if (adding_error !== null) return (LOG(`error while adding '${uri}'`), err(`error while adding '${uri}':\n  ${adding_error}`));
    LOG(`added: '${uri}'`);
    return data(new CurryedMiddleware(leaf));
  }
  //#endregion
  //#endregion

  //#region Middleware
  /**
   * @param {Middleware} middleware
   * @returns {this}
   */
  use(middleware) {
    if (this.#middleware === false) this.#middleware = [];

    this.#middleware.push(middleware);
    return this;
  }
  //#endregion
}
