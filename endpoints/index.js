/**
 * @typedef {Object.<string, function>} resolvers
 */

/**
 * @param {IncomingMessage} req request from the client
 * @param {resolvers} resolvers the array of endpoints to traverse
 * @returns {(function|false)} resFunction function to resolve request
 */
export function getRes(req, resolvers) {
  /** @type {string[]} */
  let ss = req.url.split('/');
  while (ss.length > 0) if (!!resolvers[ss.join('/')]) return resolvers[ss.join('/')];
  return false;
}

export { Endpoints } from './Endpoints.js';
export { REST } from './REST.js';

