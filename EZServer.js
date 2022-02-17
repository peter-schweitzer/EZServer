const createServer = require('http').createServer;
const readFile = require('fs').readFile;

class EZServerApp {
  /**
   * @param {string} port port the server is hosted on
   */
  constructor(port) {
    this.resolvers = {};
    this.endpoints = [];
    this.groupResFunctions = {};

    /**
     * @param {IncomingMessage} req Request from the client
     * @param {ServerResponse} res Respnose from the server
     */
    this.throw404 = (req, res) => {
      console.log(`404 on "${req.url}"`);
      fetchFromFs('./html/404.html', res);
    };

    /**
     * @param {string} reqPath path of requested URL
     * @param {function} resFunction function to resolve the request
     */
    this.addResolver = (reqPath, resFunction) => {
      this.resolvers[reqPath] = resFunction;
    };

    /**
     * @param {String} url pattern of requested URL
     * @param {function} resFunction function to resolve the request
     */
    this.addEndpoint = (url, resFunction) => {
      this.endpoints.push({ pth: url, fn: resFunction });
    };

    /**
     * @param {string} groupName name of the new group
     * @param {function} resFunction function to resolve the requests
     */
    this.createGroup = (groupName, resFunction) => {
      this.groups[groupName] = resFunction;
    };

    /**
     * @param {String} url pattern of requested URL
     * @param {string} groupName name of the group
     * */
    this.addEndpointToGroup = (url, groupName) => {
      this.addEndpoint(url, this.groupResFunctions[groupName]);
    };

    /**
     * @param {IncomingMessage} req request from the client
     * @returns {function} resFunction function to resolve request
     */
    this.getResFromEndpoints = (req) => {
      for (const { pth, fn } of this.endpoints) if (req.url.startsWith(pth)) return fn;
    };

    this.httpServer = createServer((req, res) => {
      let ep_fn = this.getResFromEndpoints(req);
      let resFn = this.resolvers[req.url] || ep_fn || this.throw404;
      resFn(req, res);
    });

    this.httpServer.listen(port);
  }
}

/**
 * @param {string} filePath path of file
 * @param {ServerResponse} res Response from Server
 */
const fetchFromFs = (filePath, res) => {
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
};

const buildRes = (res, data, { code, mime }) => {
  res.writeHead(code, { 'Content-Type': mime });
  res.write(data);
  res.end();
};

const mimeTypes = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  json: 'application/json',
  png: 'image/png',
};

/**
 * @param {string} filePath Path of file
 * @returns {string} mimeType fo the file
 */
const getType = (filePath) => {
  return mimeTypes[filePath.split('.').pop()];
};

module.exports = { App: EZServerApp, fetchFromFS: fetchFromFs };
