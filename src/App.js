import { createServer } from 'node:http';

import { ERR, LOG, WRN } from '@peter-schweitzer/ez-utils';

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

  constructor() {
    this.m_http_server = createServer((/**@type {EZIncomingMessage}*/ req, res) => {
      /** @type {LUT<string>} */
      const query = {};
      /**@type {LUT<string> & {"*"?: string[]}}*/
      const route = {};

      const url = req.url;
      const uri_end_idx = url.indexOf('?');
      if (uri_end_idx === -1) {
        req.uri = decodeURIComponent(url);
      } else {
        req.uri = decodeURIComponent(url.slice(0, uri_end_idx));

        const query_string = decodeURIComponent(url.slice(uri_end_idx + 1));
        if (query_string.length > 0) {
          const pairs = query_string.split('&');
          for (const kv of pairs) {
            const [key, value] = kv.split('=');
            if (key.length !== 0 && value?.length !== 0) query[key] = value;
          }
        }
      }

      const fn =
        get_endpoint(this.#endpoints, req) ||
        get_endpoint_with_param(this.#endpoints_with_params, req, route) ||
        get_endpoint_with_wildcard(this.#rest_endpoints_with_wildcard[req.method], req, route) ||
        get_endpoint_with_wildcard(this.#endpoints_with_wildcard, req, route);

      if (fn === false) throw404(req, res);
      else fn(req, res, new Params(query, route));
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
   * @returns {void}
   */
  get(uri, fn) {
    LOG('added get:', uri);
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.GET, uri, fn, 'GET');
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  head(uri, fn) {
    LOG('added head:', uri);
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.HEAD, uri, fn, 'HEAD');
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  post(uri, fn) {
    LOG('added post:', uri);
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.POST, uri, fn, 'POST');
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  put(uri, fn) {
    LOG('added put:', uri);
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.PUT, uri, fn, 'PUT');
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  delete(uri, fn) {
    LOG('added delete:', uri);
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.DELETE, uri, fn, 'DELETE');
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  connect(uri, fn) {
    LOG('added connect:', uri);
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.CONNECT, uri, fn, 'CONNECT');
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  options(uri, fn) {
    LOG('added options:', uri);
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.OPTIONS, uri, fn, 'OPTIONS');
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  trace(uri, fn) {
    LOG('added trace:', uri);
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.TRACE, uri, fn, 'TRACE');
  }

  /**
   * @param {string} uri uri to resolve
   * @param {ResFunction} fn function for resolve the request
   * @returns {void}
   */
  patch(uri, fn) {
    LOG('added patch:', uri);
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#rest_endpoints_with_wildcard.PATCH, uri, fn, 'PATCH');
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
    add_endpoint_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#endpoints_with_wildcard, uri, fn);
  }
  //#endregion
  //#endregion
}
