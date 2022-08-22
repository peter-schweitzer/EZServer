const { getResFunction: _getResFunction } = require('./utils');

const LOG = console.log;

class Endpoints {
  /** @type {import('./Endpoints').resolvers} */
  endpoints = {};
  /**@type {import('./Endpoints').resolvers}*/
  groups = {};

  /**
   * @param {string} url pattern of requested URL
   * @param {import('./Endpoints.js').resFunction} fn function to resolve the request
   * @returns {void}
   */
  add(route, fn) {
    LOG('addet endpoint', route);
    this.endpoints[route] = fn;
  }

  /**
   * @param {string} groupName name of the new group
   * @param {import('./Endpoints.js').resFunction} fn function to resolve the requests
   * @returns {void}
   */
  createGroup(groupName, fn) {
    LOG('created group', groupName);
    this.groups[groupName] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {string} groupName name of the group
   * @returns {void}
   */
  addToGroup(url, groupName) {
    LOG(`adding endpoint ${url} to group ${groupName}`);
    if (!this.groups[groupName]) return LOG('  invalid groupname') || false;
    this.endpoints[url] = this.groups[groupName];
  }

  /**
   * @param {import('http').IncomingMessage} req
   * @returns {(import('./utils.js').resFunction|false)}
   */
  getResFunction(req) {
    return _getResFunction(req, this.endpoints);
  }
}

module.exports = Endpoints;

