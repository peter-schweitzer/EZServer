class Parameters {
  /** @type {import("..").params} */
  m_parameters = { query: {}, route: {} };

  //#region adding params
  /** @param {string} query_string */
  m_add_query(query_string) {
    if (query_string)
      for (const kv of query_string.split('&')) {
        const [k, v] = kv.split('=');
        if (k.length && v?.length) this.m_parameters.query[k] = v;
        else return false;
      }
  }

  /**
   * @param {string[]} key_arr
   * @param {string[]} val_arr
   * @returns {boolean} was_successfull
   */
  m_add_route(key_arr, val_arr) {
    if (key_arr.length !== val_arr.length) return false;
    for (let i = 0; i < key_arr.length; i++) this.m_parameters.route[key_arr[i]] = val_arr[i];
  }
  //#endregion

  constructor() {}

  //#region getting params
  //#region querry
  /**
   * @param {string} name
   * @param {string?} defaultValue
   * @returns {string?}
   */
  query(name, defaultValue = null) {
    return this.m_parameters.query[name] || defaultValue;
  }

  /**
   * @param {string} name
   * @param {number?} fallback
   * @returns {number?}
   */
  queryInt(name, defaultValue = null) {
    try {
      return parseInt(this.query(name, defaultValue));
    } catch (e) {
      return ERR(e) || null;
    }
  }
  //#endregion

  //#region route
  /**
   * @param {string} name
   * @param {string?} defaultValue
   * @returns {string?}
   */
  route(name, defaultValue = null) {
    return this.m_parameters.route[name] || defaultValue;
  }

  /**
   * @param {string} name
   * @param {number?} fallback
   * @returns {number?}
   */
  routeInt(name, defaultValue = null) {
    try {
      return parseInt(this.route(name, defaultValue));
    } catch (e) {
      ERR(e);
      return null;
    }
  }
  //#endregion
  //#endregion
}

module.exports = { Parameters };
