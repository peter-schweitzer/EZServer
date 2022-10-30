const { readFile } = require('node:fs');

/** @type {Object.<string, string>} */
const mimeTypes = require('../data/mimeTypes.json');

/**
 * @param {IncomingMessage} req
 * @param {resolverLUT} resolvers
 * @returns {resFunction}
 */
function getResFunction(req, resolvers) {
  let ss = req.uri.split('/');
  for (; ss.length > 1; ss.pop()) {
    let path = ss.join('/');
    if (resolvers.hasOwnProperty(path)) return resolvers[path];
  }
  return resolvers['/'] || false;
}

/**
 * @param {Object.<string, any>} resolverTree
 * @param {string} uri
 * @param {resFunction} fn
 */
function addResFunctionWithParams(resolverTree, uri, fn) {
  let tmp = resolverTree;
  let current_segment = [''];
  const params = [];

  for (const part of uri.split('/').splice(1)) {
    if (part[0] !== ':' && current_segment.push(part)) continue;
    params.push(part.slice(1));

    if (current_segment.length > 1) {
      const segment = current_segment.join('/');
      tmp = tmp.hasOwnProperty('routes') ? tmp.routes : (tmp.routes = {});
      tmp = tmp.hasOwnProperty(segment) ? tmp[segment] : (tmp[segment] = { param: {} });
    }
    current_segment = [''];
    tmp = tmp.hasOwnProperty('param') ? tmp.param : (tmp.param = {});
  }

  if (current_segment.length > 1) {
    const segment = current_segment.join('/');
    tmp = tmp.hasOwnProperty('routes') ? tmp.routes : (tmp.routes = {});
    tmp = tmp.hasOwnProperty(segment) ? tmp[segment] : (tmp[segment] = {});
  }

  tmp.params = params;
  tmp.fn = fn;
}

/**
 * @param {IncomingMessage} req
 * @param {Object.<string, any>} resolverTree
 * @param {Parameters} parameters
 */
function getResFunctionWithParams(uri, resolverTree, parameters) {
  if (uri === '/') return resolverTree?.routes.hasOwnProperty('/') ? resolverTree.routes['/'].fn : false;

  const params = [];
  let tmp = resolverTree;
  let rest = uri.split('/').slice(1);

  while (true) {
    if (tmp.hasOwnProperty('routes')) {
      const ss = ['', ...rest];
      for (rest = []; ss.length > 1; rest.unshift(ss.pop())) {
        const route = ss.join('/');
        if (tmp.routes.hasOwnProperty(route)) {
          tmp = tmp.routes[route];
          break;
        }
      }
    }

    if (!tmp.hasOwnProperty('param')) break;

    tmp = tmp['param'];
    params.push(rest.shift());
  }

  if (!tmp.hasOwnProperty('fn') || !tmp.hasOwnProperty('params')) return false;

  parameters.m_add_route(tmp.params, params);
  return tmp.fn;
}

/**
 * @param {ServerResponse} res respnose from the server
 * @param {any} data data of the response
 * @param {Object} options optional options
 * @param {number} options.code status code of the response (default is 200)
 * @param {string} options.mime mime-type of the response (default is 'text/plain')
 * @returns {void}
 */
function buildRes(res, data, { code, mime } = { code: null, mime: null }) {
  res.writeHead(code || 200, { 'Content-Type': mime || 'text/plain' });
  res.write(data);
  res.end();
}

/**
 * @param {IncomingMessage} req request from the client
 * @param {ServerResponse} res response from the server
 * @returns {void}
 */
function throw404(req, res) {
  WRN('404 on', req.url);
  buildRes(res, '<!DOCTYPE html><head><meta charset="UTF-8"><title>404</title></head><body><h1>ERROR</h1><p>404 not found.</p></body></html>', {
    code: 404,
    mime: 'text/html',
  });
}

/**
 * @param {string} filePathOrName path, or name of  the file
 * @returns {string} mime-type of the file (default 'text/plain')
 */
function getType(filePathOrName) {
  return mimeTypes[filePathOrName.split('.').pop()] || WRN('mime-type not found') || 'text/plain';
}

/**
 * @param {ServerResponse} res response from the Server
 * @param {string} filePath path of the file
 * @param {number} statusCode status code f thoe response (default 200)
 * @returns {void}
 */
function serveFromFS(res, filePath, statusCode = 200) {
  LOG('reading file from FS:', filePath);
  readFile(filePath, (err, data) => {
    const header = err ? { code: 500, mime: 'text/plain' } : { code: statusCode, mime: getType(filePath) };
    buildRes(res, data || `error while loading file from fs:\n${err}`, header);
  });
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

      try {
        json = JSON.parse(buff);
      } catch (e) {
        WRN('error while parsing request body; sending code 400');
        ERR(e);
        json = false;
      }

      resolve(json);
    });
  });
}

module.exports = { getResFunction, addResFunctionWithParams, getResFunctionWithParams, buildRes, throw404, getType, serveFromFS, getBodyJSON };

/**
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 *
 * @typedef {import('..').resFunction} resFunction
 * @typedef {import('..').resolverLUT} resolverLUT
 */
