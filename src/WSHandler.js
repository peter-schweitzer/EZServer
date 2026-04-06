import { data, ERR, LOG, p2eo } from '@peter-schweitzer/ez-utils';

import { Params } from './Params.js';
import { add_ResLeaf_to_corresponding_lut, get_ResLeaf, get_ResLeaf_with_param, get_ResLeaf_with_wildcard, process_query_params } from './routing.js';
import { inspect_error } from './utils.js';

const { err: ws_err, data: WS } = await p2eo(import('ws'));
if (ws_err !== null) LOG("ws is not installed, WebSocket support won't be available");

export const WS_AVAILABLE = ws_err === null;

export class WSHandler {
  /** @type {ws_WebSocketServer | undefined} */
  #ws_server;
  get m_ws_server() {
    return this.#ws_server;
  }

  //#region endpoints
  /** @type {ResolverLUT<WSResolverLeaf>} */
  #endpoints = {};

  /** @type {TreeNode<WSResolverLeaf>} */
  #endpoints_with_params = {};

  /** @type {ResolverTreeContainer<WSResolverLeaf>} */
  #endpoints_with_wildcard = { depth: 0, root: {} };
  //#endregion

  /** @param {Server} server */
  constructor(server) {
    if (ws_err !== null) return (ERR(`ws is not installed; but required for WebSocket support!\n  ${ws_err}`), this);

    const wss = new WS.WebSocketServer({ noServer: true });
    server.on('upgrade', (msg, socket, head) => {
      //#region variables
      /** @type {LUT<string>} */
      const query = {};
      /**@type {RouteLUT}*/
      const route = {};
      //#endregion

      const req = process_query_params(msg, query);

      const leaf = get_ResLeaf(this.#endpoints, req) || get_ResLeaf_with_param(this.#endpoints_with_params, req, route) || get_ResLeaf_with_wildcard(this.#endpoints_with_wildcard, req, route);
      if (leaf === false) return socket.destroy();

      wss.handleUpgrade(req, socket, head, (ws, _) => leaf.fn(ws, req, new Params(query, route)));
    });

    this.#ws_server = wss;
  }

  /**
   * @template {string} U
   * @param {U} uri
   * @param {WSResFunction} fn
   */
  ws(uri, fn) {
    const adding_error = add_ResLeaf_to_corresponding_lut(this.#endpoints, this.#endpoints_with_params, this.#endpoints_with_wildcard, uri, { fn }).err;
    if (adding_error !== null) return inspect_error(`error while adding '${uri}'`, adding_error);
    return data(LOG(`ws added: '${uri}'`));
  }
}
