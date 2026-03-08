export class Params {
  /**@type {LUT<string>} */
  #query;
  /**@type {RouteLUT} */
  #route;

  /**
   * @param {LUT<string>} query
   * @param {RouteLUT} route
   */
  constructor(query, route) {
    this.#query = query;
    this.#route = route;
  }

  //#region getting params
  //#region query
  /**
   * @template {string|null} [T=null]
   * @param {string} name
   * @param {T} defaultValue
   * @returns {string|T}
   */
  // @ts-ignore ts(2322)
  query(name, defaultValue = null) {
    if (Object.hasOwn(this.#query, name)) return this.#query[name];
    else return defaultValue;
  }

  /**
   * @template {number|null} [T=null]
   * @param {string} name
   * @param {T} defaultValue
   * @returns {number|T}
   */
  // @ts-ignore ts(2322)
  queryNumber(name, defaultValue = null) {
    const str = this.query(name, '');
    if (!str.length) return defaultValue;

    const num = Number(str);
    if (Number.isNaN(num)) return defaultValue;
    else return num;
  }
  //#endregion

  //#region route
  /**
   * @template {string} S
   * @template {string|null} [T=null]
   * @param {S} name
   * @param {T} defaultValue
   * @returns {RouteLUT[S] | T}
   */
  // @ts-ignore ts(2322)
  route(name, defaultValue = null) {
    if (Object.hasOwn(this.#route, name)) return this.#route[name];
    else return defaultValue;
  }

  /**
   * @template {number|null} [T=null]
   * @param {string} name
   * @param {T} defaultValue
   * @returns {number|T}
   */
  // @ts-ignore ts(2322)
  routeNumber(name, defaultValue = null) {
    const str = this.route(name, '');
    if (!str.length) return defaultValue;

    const num = Number(str);
    if (Number.isNaN(num)) return defaultValue;
    else return num;
  }
  //#endregion
  //#endregion
}
