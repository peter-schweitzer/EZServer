const mimeTypes = require('./mimeTypes.json');

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
    for (const { pth, fn } of this.endpoints) if (req.url.startsWith(pth)) return fn;
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

function buildRes(res, data, { code, mime }) {
  res.writeHead(code, { 'Content-Type': mime });
  res.write(data);
  res.end();
}

/**
 * @param {string} filePath path of file
 * @param {ServerResponse} res Response from Server
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

/**
 * @param {string} filePath Path of file
 * @returns {string} mimeType fo the file
 */
function getType(filePath) {
  return mimeTypes[filePath.split('.').pop()] || console.warn('mime-type not found') || 'text/plain';
}

module.exports = { App: EZServerApp, serveFromFS };

class endpoint {
  /**@type {string} */
  pth;
  /**@type {function} */
  fn;

  /**
   * @param {string} pth
   * @param {function} fn
   */
  constructor(pth, fn) {
    this.pth = pth;
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
   * @param {string} pth
   * @param {function} fn
   */
  get(pth, fn) {
    this.GET.push(new endpoint(pth, fn));
  }

  /**
   * @param {string} pth
   * @param {function} fn
   */
  post(pth, fn) {
    this.POST.push(new endpoint(pth, fn));
  }

  /**
   * @param {string} pth
   * @param {function} fn
   */
  put(pth, fn) {
    this.PUT.push(new endpoint(pth, fn));
  }

  /**
   * @param {string} pth
   * @param {function} fn
   */
  delete(pth, fn) {
    this.DELETE.push(new endpoint(pth, fn));
  }

  /**
   * @param {string} pth
   * @param {function} fn
   */
  patch(pth, fn) {
    this.PATCH.push(new endpoint(pth, fn));
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

