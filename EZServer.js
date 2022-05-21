import mimeTypes from './mimeTypes.json' assert { type: 'json' };

const { createServer } = require('http');
const { readFile } = require('fs');

class EZServerApp {
  /**
   * @param {string} port port the server is hosted on
   */
  constructor(port) {
    this.resolvers = {};
    this.endpoints = [];
    this.groupResFunctions = {};

    this.httpServer = createServer((req, res) => {
      (this.resolvers[req.url] || this.getResFromEndpoints(req) || this.throw404)(req, res);
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
    this.endpoints.push({ pth: url, fn: resFunction });
  }

  /**
   * @param {string} groupName name of the new group
   * @param {function} resFunction function to resolve the requests
   */
  createGroup(groupName, resFunction) {
    this.groups[groupName] = resFunction;
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
    fetchFromFs('./html/404.html', res);
  }
}

const buildRes = (res, data, { code, mime }) => {
  res.writeHead(code, { 'Content-Type': mime });
  res.write(data);
  res.end();
};

/**
 * @param {string} filePath path of file
 * @param {ServerResponse} res Response from Server
 */
const fetchFromFs = (filePath, res) => {
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
};

/**
 * @param {string} filePath Path of file
 * @returns {string} mimeType fo the file
 */
function getType(filePath) {
  return mimeTypes[filePath.split('.').pop()] || console.warn('mime-type not found') || 'text/plain';
}

module.exports = { App: EZServerApp, fetchFromFS: fetchFromFs };
