export class Params {
  /**@type {LUT<string>} */
  #query;
  get queryLUT() {
    return this.#query;
  }

  /**@type {RouteLUT} */
  #route;
  get routeLUT() {
    return this.#route;
  }

  /**
   * @param {LUT<string>} query
   * @param {RouteLUT} route
   */
  constructor(query, route) {
    this.#query = query;
    this.#route = route;
  }

  //#region query
  /**
   * @template {string|null} [T=null]
   * @param {string} name
   * @param {T} defaultValue
   * @returns {string|T}
   */
  query(name, /** @type {T|null} */ defaultValue = null) {
    return this.#query[name] ?? defaultValue;
  }

  /**
   * @template {number|null} [T=null]
   * @param {string} name
   * @param {T} defaultValue
   * @returns {number|T}
   */
  queryNumber(name, /** @type {T|null} */ defaultValue = null) {
    const str = this.query(name);
    if (str !== null) {
      const num = Number(str);
      if (!Number.isNaN(num)) return num;
    }

    // @ts-ignore
    return defaultValue;
  }
  //#endregion

  //#region route
  /**
   * @template {string} S
   * @template {string|null} [T=null]
   * @param {S} name
   * @param {T} defaultValue
   * @returns {(S extends '*' ? string[] : string) | T}
   */
  route(name, /** @type {T|null} */ defaultValue = null) {
    // @ts-ignore ts(2322) '*' has to be string[]
    return this.#route[name] ?? defaultValue;
  }

  /**
   * @template {number|null} [T=null]
   * @param {string} name
   * @param {T} defaultValue
   * @returns {number|T}
   */
  routeNumber(name, /** @type {T|null} */ defaultValue = null) {
    const str = this.route(name, '');
    if (str !== null) {
      const num = Number(str);
      if (!Number.isNaN(num)) return num;
    }

    // @ts-ignore
    return defaultValue;
  }
  //#endregion
}
