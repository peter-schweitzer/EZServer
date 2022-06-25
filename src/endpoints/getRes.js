const { IncomingMessage } = require('http');

/**
 * @param {IncomingMessage} req request from the client
 * @param {resolvers} resolvers the array of endpoints to traverse
 * @returns {(resFunction|false)} resFunction function to resolve request
 */
function getRes(req, resolvers) {
  /** @type {string[]} */
  let ss = req.url.split('/');
  let res = false;
  while (ss.length > 0)
    if (!!(res = resolvers[ss.join('/')])) break;
    else ss.pop();
  return res;
}

/**
 * @typedef {import('./index.js').resFunction} resFunction
 * @typedef {import('./index.js').resolvers} resolvers
 */

module.exports = { getRes };

