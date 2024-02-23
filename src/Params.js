export class Params {
  /**@type {LUT<string>} */
  #query;
  /**@type {LUT<string> & {"*"?: string[]}} */
  #route;

  /**
   * @param {LUT<string>} query
   * @param {LUT<string> & {"*"?: string[]}} route
   */
  constructor(query, route) {
    this.#query = query;
    this.#route = route;
  }

  //#region getting params
  //#region query
  /**
   * @param {string} name
   * @param {T} defaultValue
   * @returns {string|T}
   * @template {string?} T
   */
  query(name = '', defaultValue = null) {
    if (Object.hasOwn(this.#query, name)) return this.#query[name];
    else return defaultValue;
  }

  /**
   * @param {string} name
   * @param {T} defaultValue
   * @returns {number|T}
   * @template {number?} T
   */
  queryNumber(name = '', defaultValue = null) {
    const str = this.query(name, '');
    if (!str.length) return defaultValue;

    const num = Number(str);
    return isNaN(num) ? defaultValue : num;
  }
  //#endregion

  //#region route
  /**
   * @param {S} [name='']
   * @param {T} [defaultValue=null]
   * @returns {S extends '' ? T : ((S extends '*' ? string[] : string) | T) }
   * @template {string} [S='']
   * @template {string} [T=null]
   */
  // @ts-ignore ts(2322)
  route(name = '', defaultValue = null) {
    // @ts-ignore ts(2322)
    if (Object.hasOwn(this.#route, name)) return this.#route[name];
    // @ts-ignore ts(2322)
    else return defaultValue;
  }

  /**
   * @param {string} name
   * @param {T} defaultValue
   * @returns {number|T}
   * @template {number?} T
   */
  routeNumber(name = '', defaultValue = null) {
    const str = this.route(name, '');
    if (!str.length) return defaultValue;

    const num = Number(str);
    return isNaN(num) ? defaultValue : num;
  }
  //#endregion
  //#endregion
}
