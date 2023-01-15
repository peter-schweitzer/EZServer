'use strict';

class Parameters {
  /**@type {Object.<string, string>} */
  #query = {};
  /**@type {Object.<string, string>} */
  #route = {};

  //#region adding params
  /**
   * @param {string} query_string
   * @returns {boolean} was successful
   */
  m_add_query(query_string) {
    if (!!query_string)
      for (const kv of query_string.split('&')) {
        const [k, v] = kv.split('=');
        if (!k || !v) return false;
        this.#query[k] = v;
      }
    return true;
  }

  /**
   * @param {string[]} key_arr
   * @param {string[]} val_arr
   * @returns {boolean} was successful
   */
  m_add_route(key_arr, val_arr) {
    if (key_arr.length !== val_arr.length) return false;
    for (let i = 0; i < key_arr.length; i++) this.#route[key_arr[i]] = val_arr[i];
    return true;
  }
  //#endregion

  constructor() {}

  //#region getting params
  //#region query
  /**
   * @param {string} name
   * @param {string?} defaultValue
   * @returns {string?}
   */
  query(name = null, defaultValue = null) {
    try {
      return this.#query[name] || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * @param {string} name
   * @param {number?} defaultValue
   * @returns {number?}
   */
  queryInt(name = null, defaultValue = null) {
    const str = this.query(name, defaultValue);
    if (!!str)
      try {
        return parseInt(str);
      } catch (e) {
        ERR(e);
      }
    return defaultValue;
  }
  //#endregion

  //#region route
  /**
   * @param {string} name
   * @param {string?} defaultValue
   * @returns {string?}
   */
  route(name = null, defaultValue = null) {
    return this.#route[name] || defaultValue;
  }

  /**
   * @param {string} name
   * @param {number?} defaultValue
   * @returns {number?}
   */
  routeInt(name = null, defaultValue = null) {
    const str = this.route(name, defaultValue);
    if (!!str)
      try {
        return parseInt(str);
      } catch (e) {
        ERR(e);
      }
    return defaultValue;
  }
  //#endregion
  //#endregion
}

module.exports = { Parameters };
