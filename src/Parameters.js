class Parameters {
  /** @type {params} */
  m_parameters = { query: {}, route: {} };

  //#region adding params
  /** @param {string} query_string */
  m_add_query(query_string) {
    if (!!query_string)
      for (const kv of query_string.split('&')) {
        const [k, v] = kv.split('=');
        if (k.length && v?.length) this.m_parameters.query[k] = v;
        else return false;
      }
  }

  /**
   * @param {string[]} key_arr
   * @param {string[]} val_arr
   * @returns {boolean} was_successful
   */
  m_add_route(key_arr, val_arr) {
    if (key_arr.length !== val_arr.length) return false;
    for (let i = 0; i < key_arr.length; i++) this.m_parameters.route[key_arr[i]] = val_arr[i];
  }
  //#endregion

  constructor() {}

  //#region getting params

  /**
   * @param {string} name
   * @param {string?} defaultValue
   * @param {Object.<string, string>} LUT
   * @returns
   */
  m_getter_macro = (name, defaultValue = null, LUT) => {
    return typeof name !== 'string' || !name || !LUT.hasOwnProperty(name) ? defaultValue : this.m_parameters.query[name];
  };

  //#region query
  /**
   * @param {string} name
   * @param {string?} defaultValue
   * @returns {string?}
   */
  query(name, defaultValue = null) {
    return this.m_getter_macro(name, defaultValue, this.m_parameters.query);
  }

  /**
   * @param {string} name
   * @param {number?} defaultValue
   * @returns {number?}
   */
  queryInt(name, defaultValue = null) {
    const str = this.m_getter_macro(name, defaultValue, this.m_parameters.query);
    if (!!str)
      try {
        return parseInt(str);
      } catch (e) {
        return ERR(e) || defaultValue;
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
    return this.m_getter_macro(name, defaultValue, this.m_parameters.route);
  }

  /**
   * @param {string} name
   * @param {number?} defaultValue
   * @returns {number?}
   */
  routeInt(name, defaultValue = null) {
    const str = this.m_getter_macro(name, defaultValue, this.m_parameters.route);
    if (!!str)
      try {
        return parseInt(str);
      } catch (e) {
        return ERR(e) || defaultValue;
      }
  }
  //#endregion
  //#endregion
}

module.exports = { Parameters };

/**
 * @typedef {Object} params
 * @property {Object.<string, string>} query
 * @property {Object.<string, string>} route
 */
