export class Params {
  /**@type {LUT<string>} */
  #query;
  /**@type {LUT<string>} */
  #route;

  /**
   * @param {LUT<string>} query
   * @param {LUT<string>} route
   */
  constructor(query, route) {
    this.#query = query;
    this.#route = route;
  }

  //#region getting params
  //#region query
  /**
   * @param {string} name
   * @param {string?} defaultValue
   * @returns {string?}
   */
  query(name = '', defaultValue = null) {
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
  queryNumber(name = '', defaultValue = null) {
    const str = this.query(name, '');
    if (!str.length) return defaultValue;
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
  routeNumber(name = '', defaultValue = null) {
    const str = this.route(name, '');
    if (!str.length) return defaultValue;
    const num = parseFloat(str);
    return isNaN(num) ? defaultValue : num;
  }
  //#endregion
  //#endregion
}
