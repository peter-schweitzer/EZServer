const { getResFunction: _getResFunction } = require('./getResFunction');

const LOG = console.log;

class REST {
  /** @type {import('./index').resolvers} */
  GET = {};
  /** @type {import('./index').resolvers} */
  POST = {};
  /** @type {import('./index').resolvers} */
  PUT = {};
  /** @type {import('./index').resolvers} */
  DELETE = {};
  /** @type {import('./index').resolvers} */
  PATCH = {};

  /**
   * @param {string} route URL of the endpoint
   * @param {import('./index.js').resFunction} fn
   * @returns {void}
   */
  get(route, fn) {
    console.log('addet REST.get()', route);
    this.GET[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {import('./index.js').resFunction} fn
   * @returns {void}
   */
  post(route, fn) {
    console.log('addet REST.post()', route);
    this.POST[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {import('./index.js').resFunction} fn
   * @returns {void}
   */
  put(route, fn) {
    console.log('addet REST.put()', route);
    this.PUT[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {import('./index.js').resFunction} fn
   * @returns {void}
   */
  delete(route, fn) {
    console.log('addet REST.delete()', route);
    this.DELETE[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {import('./index.js').resFunction} fn
   * @returns {void}
   */
  patch(route, fn) {
    console.log('addet REST.patch()', route);
    this.PATCH[route] = fn;
  }

  /**
   * @param {import('http').IncomingMessage} req
   * @returns {(import('./index.js').resFunction|false)}
   */
  getResFunction(req) {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    return methods.includes(req.method || ' ') ? _getResFunction(req, this[req.method]) : LOG('invalid request method') || false;
  }
}

/**
 * @param {import('http').IncomingMessage} req
 * @return {Promise<{json: Object<string, any>, http_code: number}>}
 */
function getBodyJSON(req) {
  return new Promise((resolve) => {
    let buff = '';

    req.on('data', (chunk) => {
      buff += chunk;
    });

    req.on('end', () => {
      let json = { value: null };
      let resCode = 500; // internal server error as fallback; should always be overwritten

      try {
        json = JSON.parse(buff);
        resCode = req.method === 'PUT' ? 201 : 200;
      } catch (e) {
        console.warn('error while parsing request body; sending code 400');
        console.error(e);
        resCode = 400;
      }

      resolve({ json: json, http_code: resCode });
    });
  });
}

module.exports = { REST, getBodyJSON };

