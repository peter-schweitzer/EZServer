import { createServer } from 'node:http';

import { data, ERR, LOG, WRN } from '@peter-schweitzer/ez-utils';

import { CurryedMiddleware, handle_middleware } from './middleware.js';
import { Params } from './Params.js';
import { add_ResLeaf_to_corresponding_lut, get_ResLeaf, get_ResLeaf_with_param, get_ResLeaf_with_wildcard, process_query_params } from './routing.js';
import { inspect_error, throw404 } from './utils.js';

export class App {
  /** @type {Server} */
  #http_server;
  get m_http_server() {
    return this.#http_server;
  }

  //#region endpoints
  //#region without params
  /** @type {RestLUT<ResolverLUT<ResolverLeaf>>} */
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

  /** @type {ResolverLUT<ResolverLeaf>} */
  #endpoints = {};
  //#endregion

  //#region with params
  /** @type {RestLUT<TreeNode<ResolverLeaf>>} */
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

  /** @type {TreeNode<ResolverLeaf>} */
  #endpoints_with_params = {};
  //#endregion

  //#region with wildcard
  /** @type {RestLUT<ResolverTreeContainer<ResolverLeaf>>} */
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

  /** @type {ResolverTreeContainer<ResolverLeaf>} */
  #endpoints_with_wildcard = { depth: 0, root: {} };
  //#endregion
  //#endregion

  //#region middleware
  /** @type {FalseOr<Middleware[]>} */
  #middleware = false;
  //#endregion

  constructor() {
    this.#http_server = createServer(async (msg, res) => {
      //#region variables
      /** @type {LUT<string>} */
      const query = {};
      /**@type {RouteLUT}*/
      const route = {};
      //#endregion

      const req = process_query_params(msg, query);

      if (!(await handle_middleware(this.#middleware, req, res, query, route))) return;

      //#region routing
      const method = req.method;
      const leaf =
        get_ResLeaf(this.#rest_endpoints[method], req) ||
        get_ResLeaf(this.#endpoints, req) ||
        get_ResLeaf_with_param(this.#rest_endpoints_with_params[method], req, route) ||
        get_ResLeaf_with_param(this.#endpoints_with_params, req, route) ||
        get_ResLeaf_with_wildcard(this.#rest_endpoints_with_wildcard[method], req, route) ||
        get_ResLeaf_with_wildcard(this.#endpoints_with_wildcard, req, route);

      if (leaf === false) return throw404(req, res);

      const { fn, middleware } = leaf;
      if (await handle_middleware(middleware, req, res, query, route)) fn(req, res, new Params(query, route));
      //#endregion
    });
  }

  //#region node:http Server functions
  /**
   * @param {number|string} port port the server will listen on
   * @returns {void}
   */
  listen(port) {
    this.#http_server.listen(port, () => LOG(`server listening on port ${port}`));
  }

  /** @returns {Promise<boolean>} never rejects; false if the server isn't open when close() is called */
  async close() {
    return new Promise((resolve, _) => {
      this.#http_server.close(function (err) {
        if (err === undefined) (WRN('server closed'), resolve(true));
        else (ERR(err), WRN("'close()' called, but server is already closed"), resolve(false));
      });
    });
  }
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

  //#region functions
  //#region rest endpoints
  /**
   * @param {Methods} method
   * @param {string} uri
   * @param {ResFunction} fn
   * @returns {ErrorOr<CurryedMiddleware>}
   */
  #register_rest_endpoint(method, uri, fn) {
    /** @type {ResolverLeaf} */
    const l = { fn, middleware: false };

    const { err: adding_error, data: leaf } = add_ResLeaf_to_corresponding_lut(
      this.#rest_endpoints[method],
      this.#rest_endpoints_with_params[method],
      this.#rest_endpoints_with_wildcard[method],
      uri,
      l,
    );
    if (adding_error !== null) return inspect_error(`error while adding '${method} ${uri}'`, adding_error);

    LOG(`added ${method.toLowerCase()}: '${uri}'`);
    return data(new CurryedMiddleware(leaf));
  }

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
    const { err: adding_error, data: leaf } = add_ResLeaf_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#endpoints_with_wildcard, uri, { fn, middleware: false });
    if (adding_error !== null) return inspect_error(`error while adding '${uri}'`, adding_error);

    LOG(`added '${uri}'`);
    return data(new CurryedMiddleware(leaf));
  }
  //#endregion
  //#endregion
}
