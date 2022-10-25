class Parameters {
  /** @type {params} */
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

  constructor() {}

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
}

module.exports = { Parameters };
