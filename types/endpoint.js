class endpoint {
  /**@type {string} */
  url;
  /**@type {function} */
  fn;

  /**
   * @param {string} url
   * @param {function} fn
   */
  constructor(url, fn) {
    this.url = url;
    this.fn = fn;
  }
}

/**
 * @param {IncomingMessage} req request from the client
 * @param {endpoint[]} endpoints the array of endpoints to traverse
 * @returns {function} resFunction function to resolve request
 */
function getRes(req, endpoints) {
  for (const { url, fn } of endpoints) if (req.url.startsWith(url)) return fn;
  return false;
}

module.exports = { endpoint, getRes };

