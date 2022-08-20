const { getResFunction: _getResFunction } = require('./getResFunction');

class Endpoints {
  /** @type {import('./index').resolvers} */
  endpoints = {};
  /**@type {import('./index').resolvers}*/
  groups = {};

  constructor() {}

  /**
   * @param {string} url pattern of requested URL
   * @param {import('./index.js').resFunction} fn function to resolve the request
   * @returns {void}
   */
  add(route, fn) {
    console.log('addet endpoint', route);
    this.endpoints[route] = fn;
  }

  /**
   * @param {string} groupName name of the new group
   * @param {import('./index.js').resFunction} fn function to resolve the requests
   * @returns {void}
   */
  createGroup(groupName, fn) {
    console.log('created group', groupName);
    this.groups[groupName] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {string} groupName name of the group
   * @returns {void}
   */
  addToGroup(url, groupName) {
    console.log(`adding endpoint ${url} to group ${groupName}`);
    if (!this.groups[groupName]) return console.log('  invalid groupname') || false;
    this.endpoints[url] = this.groups[groupName];
  }

  /**
   * @param {import('http').IncomingMessage} req
   * @returns {(import('./index.js').resFunction|false)}
   */
  getResFunction(req) {
    return _getResFunction(req, this.endpoints);
  }
}

module.exports = { Endpoints };

