'use strict';

export class Parameters {
  /**@type {LUT<string>} */
  #query = {};
  /**@type {LUT<string>} */
  #route = {};

  //#region adding params
  /**
   * @param {string} query_string
   * @returns {boolean} was successful
   */
  add_query(query_string) {
    if (!!query_string)
      for (const kv of query_string.split('&')) {
        const [key, value] = kv.split('=');
        if (!key || !value) return false;
        Object.defineProperty(this.#query, key, { value });
      }
    return true;
  }

  /**
   * @param {string[]} key_arr
   * @param {string[]} val_arr
   * @returns {boolean} was successful
   */
  add_route(key_arr, val_arr) {
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
  queryNumber(name = null, defaultValue = null) {
    const str = this.query(name, defaultValue);
    if (!str) return defaultValue;
    const num = parseFloat(str);
    return isNaN(num) ? defaultValue : num;
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
  routeNumber(name = null, defaultValue = null) {
    const str = this.route(name, defaultValue);
    if (!str) return defaultValue;
    const num = parseFloat(str);
    return isNaN(num) ? defaultValue : num;
  }
  //#endregion
  //#endregion
}
