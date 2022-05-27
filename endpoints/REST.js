const { getRes } = require('./index');

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
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  get(url, fn) {
    console.log('addet REST.get()', url);
    this.GET[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  post(url, fn) {
    console.log('addet REST.post()', url);
    this.POST[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  put(url, fn) {
    console.log('addet REST.put()', url);
    this.PUT[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  delete(url, fn) {
    console.log('addet REST.delete()', url);
    this.DELETE[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  patch(url, fn) {
    console.log('addet REST.patch()', url);
    this.PATCH[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {Object<string, function>} functions functions for resolving the different methods { GET, POST, PUT, DELETE, PATCH }
   */
  addMulti(url, functions) {
    console.log('REST.addMulti', url);
    let { GET, POST, PUT, DELETE, PATCH } = functions;

    let noop = () => console.log('REST multi noop');

    this.get(url, GET || noop);
    this.post(url, POST || noop);
    this.put(url, PUT || noop);
    this.delete(url, DELETE || noop);
    this.patch(url, PATCH || noop);
  }

  /**
   * @returns {(function|false)}
   */
  getRes(req) {
    switch (req.method) {
      case 'GET':
        return getRes(req, this.GET);
      case 'POST':
        return getRes(req, this.POST);
      case 'PUT':
        return getRes(req, this.PUT);
      case 'DELETE':
        return getRes(req, this.DELETE);
      case 'PATCH':
        return getRes(req, this.PATCH);
    }
    return false;
  }
}

module.exports = { REST };

