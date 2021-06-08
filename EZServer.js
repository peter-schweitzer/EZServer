const createServer = require('http').createServer;
const readFile = require('fs').readFile;

class EZServerApp {
  /**
   * @param {string} port port the server is hosted on
   */
  constructor(port) {
    this.resolvers = {};
    this.endoints = [];
    this.groupResFunctions = {};

    /**
     * @param {IncomingMessage} req Request from the client
     * @param {ServerResponse} res Respnose from the server
     */
    this.throw404 = (req, res) => {
      console.log(`404 on "${req.url}"`);
      this.fetchFromFs('./html/404.html', res);
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
      this.endpoints.push([url, resFunction]);
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
      for (const endpoint of this.endPoints) {
        if (req.url.substr(0, endpoint[0].length) == endPoint[0]) return endPoint[1];
      }
      return undefined;
    };

    /**
     * @param {string} filePath path of file
     * @param {ServerResponse} res Response from Server
     */
    this.fetchFromFs = (filePath, res) => {
      readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`error while loading file from fs:\n${err}`);
          return;
        }
        if (filePath == './html/404.html') {
          res.writeHead(404, 'text/html');
        } else {
          res.writeHead(200, getType(filePath));
        }
        console.log(`data: "${data}"`);
        res.write(data);
        res.end();
      });
    };

    this.httpServer = createServer((req, res) => {
      let resolver = this.resolvers[req.url] || this.getResFromEndpoints(req) || this.throw404;
      resolver(req, res);
    });
    this.httpServer.listen(port);
  }
}

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

module.exports = { App: EZServerApp };
