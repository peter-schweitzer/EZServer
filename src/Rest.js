class REST {
  /** @type {import('../RequestHandlers').resolvers} */
  GET = {};
  /** @type {import('../RequestHandlers').resolvers} */
  POST = {};
  /** @type {import('../RequestHandlers').resolvers} */
  PUT = {};
  /** @type {import('../RequestHandlers').resolvers} */
  DELETE = {};
  /** @type {import('../RequestHandlers').resolvers} */
  PATCH = {};

  /**
   * @param {string} route URL of the endpoint
   * @param {import('../RequestHandlers.js').resFunction} fn
   * @returns {void}
   */
  get(route, fn) {
    LOG('addet REST.get()', route);
    this.GET[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {import('../RequestHandlers.js').resFunction} fn
   * @returns {void}
   */
  post(route, fn) {
    LOG('addet REST.post()', route);
    this.POST[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {import('../RequestHandlers.js').resFunction} fn
   * @returns {void}
   */
  put(route, fn) {
    LOG('addet REST.put()', route);
    this.PUT[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {import('../RequestHandlers.js').resFunction} fn
   * @returns {void}
   */
  delete(route, fn) {
    LOG('addet REST.delete()', route);
    this.DELETE[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {import('../RequestHandlers.js').resFunction} fn
   * @returns {void}
   */
  patch(route, fn) {
    LOG('addet REST.patch()', route);
    this.PATCH[route] = fn;
  }

  /**
   * @param {import('http').IncomingMessage} req
   * @returns {(import('../RequestHandlers.js').resFunction|false)}
   */
  getResFunction(req) {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    return methods.includes(req.method || ' ') ? _getResFunction(req, this[req.method]) : LOG('invalid request method') || false;
  }
}

module.exports = REST;
