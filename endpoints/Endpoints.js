import { getRes } from './index.js';

class Endpoints {
  /** @type {import('./index').resolvers} */
  endpoints = {};
  /**@type {import('./index').resolvers}*/
  groups = {};

  constructor() {}

  /**
   * @param {string} url pattern of requested URL
   * @param {function} fn function to resolve the request
   */
  add(url, fn) {
    console.log('addet endpoint', url);
    this.endpoints[url] = fn;
  }

  /**
   * @param {string} groupName name of the new group
   * @param {function} fn function to resolve the requests
   */
  createGroup(groupName, fn) {
    console.log('created group', groupName);
    this.groups[groupName] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {string} groupName name of the group
   */
  addToGroup(url, groupName) {
    console.log(`adding endpoint ${url} to group ${groupName}`);
    if (!this.groups[groupName]) return console.log('  invalid groupname') || false;
    this.endpoints[url] = this.groups[groupName];
  }

  /**
   * @returns {(function|false)}
   */
  getRes(req) {
    return getRes(req, this.endpoints);
  }
}

export { Endpoints };

