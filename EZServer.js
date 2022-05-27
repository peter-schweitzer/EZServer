const { createServer } = require('http');
const { readFile } = require('fs');

class EZServerApp {
  /**
   * @param {string} port port the server is hosted on
   */
  constructor(port) {
    /** @type {endpoint[]} */
    this.endpoints = [];
    /** @type {Object<string, function>} */
    this.resolvers = {};
    /** @type {Object<string, function>} */
    this.groupResFunctions = {};

    this.REST = new rest_endpoints();

    this.httpServer = createServer((req, res) => {
      (this.resolvers[req.url] || this.getResFromEndpoints(req) || this.REST.getRes(req) || this.throw404)(req, res);
    });

    this.httpServer.listen(port);
  }

  /**
   * @param {string} reqPath path of requested URL
   * @param {function} resFunction function to resolve the request
   */
  addResolver(reqPath, resFunction) {
    this.resolvers[reqPath] = resFunction;
  }

  /**
   * @param {string} url pattern of requested URL
   * @param {function} resFunction function to resolve the request
   */
  addEndpoint(url, resFunction) {
    console.log('addet endpoint', url);
    this.endpoints.push(new endpoint(url, resFunction));
  }

  /**
   * @param {string} groupName name of the new group
   * @param {function} resFunction function to resolve the requests
   */
  createGroup(groupName, resFunction) {
    this.groupResFunctions[groupName] = resFunction;
  }

  /**
   * @param {String} url pattern of requested URL
   * @param {string} groupName name of the group
   * */
  addEndpointToGroup(url, groupName) {
    this.addEndpoint(url, this.groupResFunctions[groupName]);
  }

  /**
   * @param {IncomingMessage} req request from the client
   * @returns {function} resFunction function to resolve request
   */
  getResFromEndpoints(req) {
    for (const { url: pth, fn } of this.endpoints) if (req.url.startsWith(pth)) return fn;
  }

  /**
   * @param {IncomingMessage} req Request from the client
   * @param {ServerResponse} res Respnose from the server
   */
  throw404(req, res) {
    console.log('404 on', req.url);
    serveFromFS('./html/404.html', res);
  }
}

/**
 * @param {string} filePath path of file
 * @param {ServerResponse} res Response the from Server
 */
function serveFromFS(filePath, res) {
  console.log('reading file from FS:', filePath);
  readFile(filePath, (err, data) => {
    let header;

    if (err) {
      header = { code: 500, mime: 'text/plain' };
    } else if (filePath === './html/404.html') {
      header = { code: 404, mime: 'text/html' };
    } else {
      header = { code: 200, mime: getType(filePath) };
    }

    buildRes(res, data || `error while loading file from fs:\n${err}`, header);
  });
}

module.exports = { App: EZServerApp, serveFromFS };

const mimeTypes = require('./mimeTypes.json');

/**
 * @param {ServerResponse} res Respnose from the server
 * @param {any} data data of the response
 * @param {number} code http status code
 */
function buildRes(res, data, { code, mime }) {
  res.writeHead(code, { 'Content-Type': mime });
  res.write(data);
  res.end();
}

/**
 * @param {string} filePath Path of file
 * @returns {string} mimeType fo the file
 */
function getType(filePath) {
  return mimeTypes[filePath.split('.').pop()] || console.warn('mime-type not found') || 'text/plain';
}

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

class rest_endpoints {
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
   * @param {string} url
   * @param {function} fn
   */
  get(url, fn) {
    console.log('addet REST.get()', url);
    this.GET.push(new endpoint(url, fn));
  }

  /**
   * @param {string} url
   * @param {function} fn
   */
  post(url, fn) {
    console.log('addet REST.post()', url);
    this.POST.push(new endpoint(url, fn));
  }

  /**
   * @param {string} url
   * @param {function} fn
   */
  put(url, fn) {
    console.log('addet REST.put()', url);
    this.PUT.push(new endpoint(url, fn));
  }

  /**
   * @param {string} url
   * @param {function} fn
   */
  delete(url, fn) {
    console.log('addet REST.delete()', url);
    this.DELETE.push(new endpoint(url, fn));
  }

  /**
   * @param {string} url
   * @param {function} fn
   */
  patch(url, fn) {
    console.log('addet REST.patch()', url);
    this.PATCH.push(new endpoint(url, fn));
  }

  /**
   * @returns {(function|false)}
   */
  getRes(req) {
    switch (req.method) {
      case 'GET':
        for (ep in this.GET) if (req.url.startsWith(ep.pth)) return ep.fn;
        break;
      case 'POST':
        for (ep in this.POST) if (req.url.startsWith(ep.pth)) return ep.fn;
        break;
      case 'PUT':
        for (ep in this.PUT) if (req.url.startsWith(ep.pth)) return ep.fn;
        break;
      case 'DELETE':
        for (ep in this.DELETE) if (req.url.startsWith(ep.pth)) return ep.fn;
        break;
      case 'PATCH':
        for (ep in this.PATCH) if (req.url.startsWith(ep.pth)) return ep.fn;
        break;
      default:
        return false;
    }
  }
}

