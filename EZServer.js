let { createServer } = require('http');
let { readFile } = require('fs');

let mimeTypes = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  json: 'application/json',
  png: 'image/png',
  /**
   * @param filePath Path of file
   */
  getType: (filePath) => {
    return mimeTypes[filePath.split('.').pop()];
  },
};

let { getType } = mimeTypes;

class App {
  /**
   * @param {string} port port the server is hosted on
   */
  constructor(port) {
    /**
     * @param {string} filePath path of file
     * @param {ServerResponse} res Response from Server
     */
    this.fetchFS = (filePath, res) => {
      readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('error while loading file from fs');
          return;
        }
        if (filePath == './html/404.html') {
          res.writeHead(404, 'text/html');
        } else {
          res.writeHead(200, getType(filePath));
        }
        res.end(data);
      });
    };

    /**
     * @param {IncomingMessage} req Request from the client
     * @param {ServerResponse} res Respnose from the server
     */
    this.throw404 = (req, res) => {
      console.log(req.url);
      fetchFS('./html/404.html', res);
    };

    this.httpServer = createServer((req, res) => {
      console.log(req.url);
      (this.resolvers[req.url] || this.endPoints[req.url.split('/')[1]] || this.throw404)(req, res);
    }).listen(port);
    this.resolvers = this.endPoints = {};

    /**
     * @param {string} path path of requested URL
     * @param {function} resFunction function to resolve the request
     */
    this.addResolver = (path, resFunction) => {
      this.resolvers[path] = resFunction;
    };

    /**
     * @param {string} path path of requested URL
     * @param {function} resFunction function to resolve the request
     */
    this.addEndpoint = (path, resFunction) => {
      this.endPoints[path] = resFunction;
    };
  }
}

module.exports = { App: App };
