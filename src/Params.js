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
   * @template {string?} T
   * @param {string} name
   * @param {T} defaultValue
   * @returns {string|T}
   */
  query(name = '', defaultValue = null) {
    if (Object.hasOwn(this.#query, name)) return this.#query[name];
    else return defaultValue;
  }

  /**
   * @template {number?} T
   * @param {string} name
   * @param {T} defaultValue
   * @returns {number|T}
   */
  queryNumber(name = '', defaultValue = null) {
    const str = this.query(name, '');
    if (!str.length) return defaultValue;

    const num = Number(str);
    if (Number.isNaN(num)) return defaultValue;
    else return num;
  }
  //#endregion

  //#region route
  /**
   * @template {string} [S='']
   * @template {string} [T=null]
   * @param {S} [name='']
   * @param {T} [defaultValue=null]
   * @returns {S extends '' ? T : ((S extends '*' ? string[] : string) | T) }
   */
  // @ts-ignore ts(2322)
  route(name = '', defaultValue = null) {
    // @ts-ignore ts(2322)
    if (Object.hasOwn(this.#route, name)) return this.#route[name];
    // @ts-ignore ts(2322)
    else return defaultValue;
  }

  /**
   * @template {number?} T
   * @param {string} name
   * @param {T} defaultValue
   * @returns {number|T}
   */
  routeNumber(name = '', defaultValue = null) {
    const str = this.route(name, '');
    if (!str.length) return defaultValue;

    const num = Number(str);
    if (Number.isNaN(num)) return defaultValue;
    else return num;
  }
  //#endregion
  //#endregion
}
