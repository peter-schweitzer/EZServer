const { endpoint, getRes } = require('../types/endpoint');

class Endpoints {
  /** @type {endpoint[]} */
  endpoints = [];
  /**@type {Object<string, function>}*/
  groups = {};

  /**
   * @param {string} url pattern of requested URL
   * @param {function} fn function to resolve the request
   */
  add(url, fn) {
    console.log('addet endpoint', url);
    this.endpoints.add(new endpoint(url, fn));
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
    console.log(`addet endpoint ${url} to group ${groupName}`);
    this.endpoints.push(url, this.groups[groupName]);
  }

  /**
   * @returns {(function|false)}
   */
  getRes(req) {
    return getRes(req, this.endpoints);
  }
}

module.exports = { Endpoints };

