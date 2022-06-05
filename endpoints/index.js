import { IncomingMessage, ServerResponse } from 'http';

/**
 * @callback resfunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */

/**
 * @typedef {Object.<string, resfunction>} resolvers
 */

/**
 * @param {IncomingMessage} req request from the client
 * @param {resolvers} resolvers the array of endpoints to traverse
 * @returns {(resfunction|false)} resFunction function to resolve request
 */
export function getRes(req, resolvers) {
  /** @type {string[]} */
  let ss = req.url.split('/');
  let res = false;
  while (ss.length > 0)
    if (!!(res = resolvers[ss.join('/')])) break;
    else ss.pop();
  return res;
}

export { Endpoints } from './Endpoints.js';
export { REST } from './REST.js';

