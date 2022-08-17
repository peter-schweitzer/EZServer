const { getResFunction } = require('./getResFunction');

class Resolvers {
  /** @type {import('./').resolvers} */
  resolvers = {};

  /**
   * @param {string} route path of requested URL
   * @param {import('./').resFunction} resFunction function to resolve the request
   * @returns {void}
   */
  add(route, resFunction) {
    this.resolvers[route] = resFunction;
  }

  /**
   * @param {import('http').IncomingMessage} req
   * @returns {(import('./').resFunction|false)}
   */
  getResFunction(req) {
    return this.resolvers[req.url];
  }
}

module.exports = { Resolvers };

