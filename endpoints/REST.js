const { endpoint, getRes } = require('../types/endpoint');

class REST {
  /** @type {endpoint[]} */
  GET = [];
  /** @type {endpoint[]} */
  POST = [];
  /** @type {endpoint[]} */
  PUT = [];
  /** @type {endpoint[]} */
  DELETE = [];
  /** @type {endpoint[]} */
  PATCH = [];

  /**
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  get(url, fn) {
    console.log('addet REST.get()', url);
    this.GET.push(new endpoint(url, fn));
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  post(url, fn) {
    console.log('addet REST.post()', url);
    this.POST.push(new endpoint(url, fn));
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  put(url, fn) {
    console.log('addet REST.put()', url);
    this.PUT.push(new endpoint(url, fn));
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  delete(url, fn) {
    console.log('addet REST.delete()', url);
    this.DELETE.push(new endpoint(url, fn));
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {function} fn
   */
  patch(url, fn) {
    console.log('addet REST.patch()', url);
    this.PATCH.push(new endpoint(url, fn));
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
    this.pathch(url, PATCH || noop);
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

