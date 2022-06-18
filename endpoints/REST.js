const { IncomingMessage } = require('http');

const { getRes } = require('./getRes');

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
   * @param {resFunction} fn
   */
  get(url, fn) {
    console.log('addet REST.get()', url);
    this.GET[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {resFunction} fn
   */
  post(url, fn) {
    console.log('addet REST.post()', url);
    this.POST[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {resFunction} fn
   */
  put(url, fn) {
    console.log('addet REST.put()', url);
    this.PUT[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {resFunction} fn
   */
  delete(url, fn) {
    console.log('addet REST.delete()', url);
    this.DELETE[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {resFunction} fn
   */
  patch(url, fn) {
    console.log('addet REST.patch()', url);
    this.PATCH[url] = fn;
  }

  /**
   * @returns {(resFunction|false)}
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

/**
 * @param {IncomingMessage} req
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

/** @typedef {import('./index.js').resFunction} resFunction */

module.exports = { REST, getBodyJSON };

